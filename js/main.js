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
    })
  })
}

function calculate() {
  const r_min = 0.02, r_max = 0.12, r_point = 0.7;

  // -------------------------------------------------------------------------------------------------------------------
  // Reward Calculation
  // -------------------------------------------------------------------------------------------------------------------
  let delegationRate = data["delegatedSupply"] / data["totalSupply"];
  if(delegationRate >= 0.7) delegationRate = 0.7;

  const r_rep = ((r_max - r_min) / (r_point ** 2)) * (delegationRate - r_point) ** 2 + r_min;
  const roi = (r_rep * 100 * 3).toFixed(2); // Assuming same delegation rates for other two sectors --> * 3

  const holdings = $("#holdings").val();
  const rewards = holdings * (roi / 100);

  console.log("Rewards: " + rewards + " ICX");

  // -------------------------------------------------------------------------------------------------------------------
  // Un-Staking Period Calculation
  // -------------------------------------------------------------------------------------------------------------------
  const l_min = 5, l_max = 20;

  const l_period = ((l_max - l_min) / (r_point ** 2)) * (((data["stakedSupply"] / data["totalSupply"]) - r_point) ** 2) + l_min;

  console.log("Un-Staking Period: " + l_period + " days");
}