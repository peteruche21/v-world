// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";

error Unavailable();

contract VWorld is Ownable {
    /**
    @notice this event is usde to keep track of land owners over time.
     */
    event PurchasedLand(
        address indexed newOwner,
        uint256[2] indexed cordinates
    );

    struct Land {
        uint256[2] cordinates;
        uint256 area;
        bool owned;
    }

    Land[] public lands;
    // maps a land owner to the list of land cordinates owned by him/her
    mapping(address => uint256[2][]) public landsToOwner;
    // keeps track of no of land  purchases made
    uint256 public noOfLandsSold = 0;

    /**
    @param _lands an array of land cordinates
    initializes vworld with a predefined list of land cordinates
     */
    constructor(uint256[2][] memory _lands) {
        for (uint256 i = 0; i < _lands.length; i++) {
            lands.push(
                Land({
                    cordinates: _lands[i],
                    area: _lands[i][0] * _lands[i][1],
                    owned: false
                })
            );
        }
    }

    /**
    @param _cordinates [x,y] an array of linear land cordinates
    takes a tuple of cordinates, searches through the lands in Land artray
    if there is a corresponding land, assigns it to the msg.sender
    if the land has been purchased, throws an error
     */
    function purchaseLand(uint256[2] calldata _cordinates) external payable {
        for (uint256 i = 0; i < lands.length; i++) {
            if (
                lands[i].cordinates[0] == _cordinates[0] &&
                lands[i].cordinates[0] == _cordinates[0]
            ) {
                if (lands[i].owned) revert Unavailable();
                landsToOwner[msg.sender].push(_cordinates);
                lands[i].owned = true;
                noOfLandsSold += 1;
                emit PurchasedLand(msg.sender, _cordinates);
            }
        }
    }

    /**
    @param _newOwner the owner you wish to tranfer your to
    @param _cordinates the land cordinates for the land you wish to transfer its ownership
    #lto - loads storage ref list of lands owned by an individual to memory
    iterates over lto, if _cordinates match, removes the land from the list.
    adds it to the new owners list
     */
    function transferLandOwnership(
        address _newOwner,
        uint256[2] memory _cordinates
    ) external {
        uint256[2][] memory lto = landsToOwner[msg.sender];
        for (uint256 i = 0; i < lto.length; i++) {
            if (lto[i][0] == _cordinates[0] && lto[i][1] == _cordinates[1]) {
                landsToOwner[msg.sender][i] = lto[lto.length - 1];
                landsToOwner[msg.sender].pop();
                landsToOwner[_newOwner].push(_cordinates);
                emit PurchasedLand(_newOwner, _cordinates);
            }
        }
    }

    /**
    @param _user the land owner
    @return uint256[2][] returns an array containing the list of land cordinates owned by _user
     */
    function getUserLands(address _user)
        public
        view
        returns (uint256[2][] memory)
    {
        return landsToOwner[_user];
    }

    /**
    @return uint256[2][] a two dimensional array containing all the lands that are not yet purchased
    #availableLands - loads new memory ref array of size (lands) to memory
    iterates over all lands in (lands) if land is not owned, adds it to #availableLands
     */
    function getAvailableLands() public view returns (uint256[2][] memory) {
        uint256[2][] memory availableLands = new uint256[2][](lands.length);
        for (uint256 i = 0; i < lands.length; i++) {
            if (!lands[i].owned) {
                availableLands[i] = lands[i].cordinates;
            }
        }
        return availableLands;
    }

    /**
    @return Land[] an array of all lands in vworld
    #allLands - loads new memory ref array of size (lands) to memory
    iterates over all lands in (lands) an apends to memory ref #allLands
     */
    function getAllLands() public view returns (Land[] memory) {
        Land[] memory allLands = new Land[](lands.length);
        for (uint256 i = 0; i < lands.length; i++) {
            allLands[i] = lands[i];
        }
        return allLands;
    }

    /**
    @notice low level call
    transfers all funds (land purchase fees) to the creator of the contract
     */
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "failed to widthraw funds");
    }
}
