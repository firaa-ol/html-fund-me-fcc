import { abi, contractAddress } from "./constants.js";
import { ethers } from "./ethers-5.1.esm.min.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    alert("Wallet Connected");
    connectButton.innerHTML = "Connected";
  } else {
    alert("No Metamask");
  }
}

async function fund() {
  ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResp = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });

      await listenForTransactionMine(txResp, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(txResp, provider) {
  console.log(`Mining ${txResp.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(txResp.hash, (txReceipt) => {
      console.log(`Completed with ${txReceipt.confirmations} confirmations`);
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResp = await contract.withdraw();
      await listenForTransactionMine(txResp, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
