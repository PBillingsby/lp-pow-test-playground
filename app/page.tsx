"use client"
import { useEffect, useState } from "react";
import { ethers, formatEther, formatUnits, JsonRpcProvider } from "ethers";
import Image from "next/image";
import { powAbi } from "../powAbi"
import { oldPowAbi } from "../oldPowAbi"

const infuraUrl = "https://sepolia-rollup.arbitrum.io/rpc";

const tokenContractAddress = "0x8B852BA45293d6dd51B10c57625C6c5f25ADFB40"; // POW new
const oldContractAddress = "0xacDf1005fAb67C13603C19aC5471F0c7dDBc90b2" // POW old
const userAddress = "0x765fEB3FB358867453B26c715a29BDbbC10Be772"; // Change this to whatever address is for the user

const getTokenBalanceAsync = async (userAddress) => {
  const provider = new JsonRpcProvider(infuraUrl);
  const contract = new ethers.Contract(oldContractAddress, oldPowAbi, provider);

  console.log(contract)
  const submissionCount = await contract.minerSubmissionCount(userAddress);
  console.log(submissionCount)
  // const submissions = [];
};

const getEthBalanceAsync = async (userAddress) => {
  const provider = new JsonRpcProvider(infuraUrl);
  const balanceWei = await provider.getBalance(userAddress);
  const balanceEth = parseFloat(formatEther(balanceWei));

  return balanceEth;
};

export default function Home() {
  const [ethBalance, setEthBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);

  useEffect(() => {
    const fetchBalances = async () => {
      const ethBalance = await getEthBalanceAsync(userAddress);
      setEthBalance(ethBalance);

      const tokenBalance = await getTokenBalanceAsync(userAddress);
      setTokenBalance(tokenBalance);
    };

    fetchBalances();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Balances for {userAddress}</h1>
      <p>ETH Balance: {ethBalance !== null ? ethBalance : "Loading..."}</p>
      <p>LP Balance: {tokenBalance !== null ? tokenBalance : "Loading..."}</p>
    </main>
  );
}
