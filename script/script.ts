// const { ethers } = require("ethers");
// const oldPowAbi = require("./oldPowAbi"); // Ensure this path is correct

// const infuraUrl = "https://sepolia-rollup.arbitrum.io/rpc";
// const oldContractAddress = "0xacDf1005fAb67C13603C19aC5471F0c7dDBc90b2"; // POW old
// const walletAddress = "0xBf8443EF0D056d10CD213a11F64C4d4F71f75052"; // Change this to the desired user address

const { ethers } = require("ethers");
const oldPowAbi = require("./oldPowAbi");

const infuraUrl = "https://sepolia-rollup.arbitrum.io/rpc";
const oldContractAddress = "0xacDf1005fAb67C13603C19aC5471F0c7dDBc90b2"; // POW old
const walletAddress = "0xBf8443EF0D056d10CD213a11F64C4d4F71f75052"; // Change this to the desired user address

const firstPhase = 0;

var currentPhase = detectCurrentPhase();
const phaseMultiplier = 0.9;
const pointsPerMegaHashesPerSecond = 10;
var basePointsAvailableThisPhase = pointsPerMegaHashesPerSecond * phaseMultiplier;

// It's the 4x multiplier for daily rewards
const clintsConstant = 1.3195;

// Wallet address is being used as the node ID
// BUT, there can be many bacalhau node IDs to one wallet address
const slashPcntPerDay = 0.10;

const provider = new ethers.JsonRpcProvider(infuraUrl);
const contract = new ethers.Contract(oldContractAddress, oldPowAbi, provider);

async function sumOfWalletAddressHashRatesForDay(walletAddress) {
  // Sum all hash rates for this walletAddress
  // Only include in the sum if it was part of a contiguous 4-hour sequence of valid PoW submissions
  // Hash rates not part of a continuous 4-hour sequence don't get counted

  try {
    const submissionCount = await contract.minerSubmissionCount(walletAddress);
    let totalHashRate = 0;

    for (let i = 0; i < submissionCount; i++) {
      const submission = await contract.powSubmissions(walletAddress, i);
      // console.log(`Submission ${i}: `, submission)
      // Validate 4-hour sequence logic
      if (isValid4HourSequence(submission.timestamp)) {
        totalHashRate += parseInt(submission.nonce); // Assuming nonce represents hash rate
      }
    }

    // Calculate using start timestamp and complete_timestap
    getAllPoWSubmissionsForDay(walletAddress)
    return totalHashRate;
  } catch (error) {
    console.error("Error fetching hash rates:", error);
  }
}

async function getAllPoWSubmissionsForDay(walletAddress) {
  const validProofs = await contract.validProofs()
  console.log("VALID PROOFS: ", validProofs)
  // Returns array of ValidPoWSubmissions, probably from postgres
  // This example assumes direct contract interaction

  try {
    const submissions = [];
    const submissionCount = await contract.minerSubmissionCount(walletAddress);

    for (let i = 0; i < submissionCount; i++) {
      const submission = await contract.powSubmissions(walletAddress, i);
      submissions.push(submission);
    }

    console.log("Submissions: ", submissions)
    return submissions;
  } catch (error) {
    console.error("Error fetching PoW submissions:", error);
  }
}

async function calculateRewardsForDay(walletAddress) {
  const fourHourWindowCount = await countOf4HourWindows(walletAddress);

  if (fourHourWindowCount < 1) {
    await slashRewards(walletAddress);
  } else {
    const totalHashRate = await sumOfWalletAddressHashRatesForDay(walletAddress);
    const rewards = Math.pow(clintsConstant, fourHourWindowCount - 1) * totalHashRate;
    await saveRewardsToDatabase(walletAddress, rewards);
  }
}

async function saveRewardsToDatabase(walletAddress, rewards) {
  // Save rewards to database
  // Example function
  console.log(`Saving rewards for ${walletAddress}: ${rewards}`);
  // Add your database saving logic here
}

async function getSumOfRewardsForWalletAddressSoFar(walletAddress) {
  // Get from db
  // Example function
  console.log(`Fetching sum of rewards for ${walletAddress} from database`);
  // Add your database fetching logic here
}

async function slashRewards(walletAddress) {
  const rewards = await getSumOfRewardsForWalletAddressSoFar(walletAddress);
  const slashedRewards = (1 - slashPcntPerDay) * rewards;
  console.log(`Slashed rewards for ${walletAddress}: ${slashedRewards}`);
  return slashedRewards;
}

// Example placeholder for detectCurrentPhase
function detectCurrentPhase() {
  // Your logic to detect current phase
  return 1; // Placeholder return value
}

// Example placeholder for countOf4HourWindows
async function countOf4HourWindows(walletAddress) {
  // Your logic to count 4-hour windows
  return 1; // Placeholder return value
}

// Example placeholder for isValid4HourSequence
function isValid4HourSequence(timestamp) {
  // Your logic to validate 4-hour sequence
  return true; // Placeholder return value
}

// Call the main function
(async () => {
  await calculateRewardsForDay(walletAddress);
})();
