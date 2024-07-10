import hardhat from "hardhat";

const { ethers } = hardhat;

async function main() {
    const MyDApp = await ethers.getContractFactory("MyDApp");
    const myDApp = await MyDApp.deploy();
    await myDApp.deployed();
    console.log("MyDApp deployed to:", myDApp.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
