const r_min = 0.02, r_max = 0.12, r_point = 0.7;

const data = {};

function fetchIconNetworkData() {
  axios.get("https://tracker.icon.foundation/v0/main/mainInfo").then(function (mainInfoResponse) {
    const totalSupply = mainInfoResponse.data.tmainInfo.icxSupply;
    const circulatingSupply = mainInfoResponse.data.tmainInfo.icxCirculationy;
    const marketCap = mainInfoResponse.data.tmainInfo.marketCap;

    data["totalSupply"] = totalSupply;
    data["circulatingSupply"] = circulatingSupply;
    data["marketCap"] = marketCap;

    console.log("Total Supply: " + totalSupply + " ICX");
    console.log("Circulating Supply: " + circulatingSupply + " ICX");
    console.log("MarketCap: " + marketCap + " USD");

    axios.get("https://tracker.icon.foundation/v3/iiss/prep/list?count=1").then(function (prepListResponse) {
      const stakedSupply = prepListResponse.data.data[0].totalStake;
      const delegatedSupply = prepListResponse.data.data[0].totalDelegated;

      data["stakedSupply"] = stakedSupply;
      data["delegatedSupply"] = delegatedSupply;

      console.log("Staked Supply: " + stakedSupply + " ICX");
      console.log("Delegated Supply: " + delegatedSupply + " ICX");

      $("#staked").text(numeral(stakedSupply).format("0,0") + " ICX");
      $("#voted").text(numeral(delegatedSupply).format("0,0") + " ICX");
      $("#reward-rate").text(numeral(getRewardRate()).format("0.00") + " %");
      $("#un-staking-period").text("~" + numeral(getUnStakingPeriod()).format("0") + " days");
    })
  })
}

function getUnStakingPeriod() {
  const l_min = 5, l_max = 20;

  const totalSupply = data["totalSupply"];
  const stakedSupply = data["stakedSupply"];

  return ((l_max - l_min) / (r_point ** 2)) * (((stakedSupply / totalSupply) - r_point) ** 2) + l_min;
}

function getRewardRate() {
  const totalSupply = data["totalSupply"];
  const delegatedSupply = data["delegatedSupply"];

  let delegationRate = delegatedSupply / totalSupply;
  if(delegationRate >= 0.7) delegationRate = 0.7;

  const r_rep = ((r_max - r_min) / (r_point ** 2)) * (delegationRate - r_point) ** 2 + r_min;

  return (r_rep * 100 * 3).toFixed(2); // Assuming same delegation rates for other two sectors --> * 3
}

function calculateRewards() {
  const holdings = $("#holdings").val();
  const rewardRate = getRewardRate();

  const rewards = holdings * (rewardRate / 100); // in ICX

  $("#result").text(numeral(rewards).format("0.00") + " ICX");
}