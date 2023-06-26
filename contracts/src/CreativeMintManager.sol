// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IZoraCreator1155Factory} from "@zoralabs/zora-1155-contracts/src/interfaces/IZoraCreator1155Factory.sol";
import {IZoraCreator1155} from "@zoralabs/zora-1155-contracts/src/interfaces/IZoraCreator1155.sol";
import {ICreatorRoyaltiesControl} from "@zoralabs/zora-1155-contracts/src/interfaces/ICreatorRoyaltiesControl.sol";
import {ZoraCreator1155Impl} from "@zoralabs/zora-1155-contracts/src/nft/ZoraCreator1155Impl.sol";
import {ZoraCreator1155FactoryImpl} from "@zoralabs/zora-1155-contracts/src/factory/ZoraCreator1155FactoryImpl.sol";

contract CreativeMintManager is Ownable2Step {
    error ProjectNotSetup();
    error CallError(bytes);
    event MintedNewToken(address indexed user, address indexed target, uint256 indexed tokenId, string media);

    mapping(string => address) public projectTypeContracts;
    struct MintInfo {
        address creator;
        uint256 mintedAt;
    }
    // contract -> tokenId -> info
    mapping(address => mapping(uint256 => MintInfo)) mintInfos;

    address immutable zoraFactory;

    constructor(address _owner, address _zoraFactory) Ownable2Step() {
        zoraFactory = _zoraFactory;
        transferOwnership(_owner);
    }

    function registerProject(
        string memory projectType,
        string memory contractURI
    ) external onlyOwner {
        bytes[] memory setupActions = new bytes[](1);
        setupActions[0] = abi.encode(
            ZoraCreator1155Impl.setFundsRecipient.selector,
            payable(address(0))
        );

        ICreatorRoyaltiesControl.RoyaltyConfiguration
            memory royaltyConfiguration = ICreatorRoyaltiesControl
                .RoyaltyConfiguration({
                    royaltyMintSchedule: 0,
                    royaltyBPS: 0,
                    royaltyRecipient: address(0)
                });
        address newContract = IZoraCreator1155Factory(zoraFactory)
            .createContract(
                contractURI,
                string.concat(projectType, " [Creative Mint]"),
                royaltyConfiguration,
                payable(address(this)),
                setupActions
            );
        projectTypeContracts[projectType] =  newContract;
    }

    function mintProject(
        string memory projectType,
        string memory tokenURI,
        uint256 maxSupply
    ) external {
        address toMint = projectTypeContracts[projectType];
        if (toMint == address(0)) {
            revert ProjectNotSetup();
        }
        uint256 newTokenId = IZoraCreator1155(toMint).setupNewToken(
            tokenURI,
            maxSupply
        );
        IZoraCreator1155(toMint).addPermission(
            newTokenId,
            msg.sender,
            IZoraCreator1155(toMint).PERMISSION_BIT_ADMIN()
        );
        IZoraCreator1155(toMint).adminMint(msg.sender, newTokenId, 1, "");
        emit MintedNewToken(msg.sender, toMint, newTokenId, tokenURI);
    }

    function updateProject(
        address toMint,
        bytes memory call
    ) external onlyOwner {
        (bool ok, bytes memory err) = toMint.call(call);
        if (!ok) {
            revert CallError(err);
        }
    }
}
