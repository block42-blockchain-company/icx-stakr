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
  //$("#result").text(numeral(rewards).format("0.00") + " ICX");

  //No Staking Rewards
  const noStakingRewards = 0;
  $("#noStakingDay").text(numeral(noStakingRewards).format("0.00") + " ICX");
  $("#noStakingWeek").text(numeral(noStakingRewards).format("0.00") + " ICX");
  $("#noStakingMonth").text(numeral(noStakingRewards).format("0.00") + " ICX");
  $("#noStaking1Year").text(numeral(noStakingRewards).format("0.00") + " ICX");
  $("#noStaking2Year").text(numeral(noStakingRewards).format("0.00") + " ICX");
  $("#noStaking3Year").text(numeral(noStakingRewards).format("0.00") + " ICX");

  //One Time Staking Rewards
  const onerewards = holdings * (rewardRate / 100); // in ICX
  const oneTimeStakingRewards = new Array(onerewards / 365, onerewards / 52, onerewards / 12, onerewards, onerewards * 2, onerewards * 3);
  $("#oneTimeStakingDay").text(numeral(oneTimeStakingRewards[0]).format("0.00") + " ICX");
  $("#oneTimeStakingWeek").text(numeral(oneTimeStakingRewards[1]).format("0.00") + " ICX");
  $("#oneTimeStakingMonth").text(numeral(oneTimeStakingRewards[2]).format("0.00") + " ICX");
  $("#oneTimeStaking1Year").text(numeral(oneTimeStakingRewards[3]).format("0.00") + " ICX");
  $("#oneTimeStaking2Year").text(numeral(oneTimeStakingRewards[4]).format("0.00") + " ICX");
  $("#oneTimeStaking3Year").text(numeral(oneTimeStakingRewards[5]).format("0.00") + " ICX");

  //Monthly Compounding rewards
  const monthlyCompounding = (holdings * Math.pow((1 + (rewardRate / (12 * 100))), (12 * 1))) - holdings;
  const monthlyCompounding_2Y = (holdings * Math.pow((1 + (rewardRate / (12 * 100))), (12 * 2))) - holdings;
  const monthlyCompounding_3Y = (holdings * Math.pow((1 + (rewardRate / (12 * 100))), (12 * 3))) - holdings;
  const monthlyCompoundingRewards = new Array(monthlyCompounding / 365, monthlyCompounding / 52, monthlyCompounding / 12, monthlyCompounding, monthlyCompounding_2Y, monthlyCompounding_3Y);
  $("#monthlyCompoundingDay").text(numeral(monthlyCompoundingRewards[0]).format("0.00") + " ICX");
  $("#monthlyCompoundingWeek").text(numeral(monthlyCompoundingRewards[1]).format("0.00") + " ICX");
  $("#monthlyCompoundingMonth").text(numeral(monthlyCompoundingRewards[2]).format("0.00") + " ICX");
  $("#monthlyCompounding1Year").text(numeral(monthlyCompoundingRewards[3]).format("0.00") + " ICX");
  $("#monthlyCompounding2Year").text(numeral(monthlyCompoundingRewards[4]).format("0.00") + " ICX");
  $("#monthlyCompounding3Year").text(numeral(monthlyCompoundingRewards[5]).format("0.00") + " ICX");

  //Weekly Compounding rewards
  const weeklyCompounding = (holdings * Math.pow((1 + (rewardRate / (52 * 100))), (52 * 1))) - holdings;
  const weeklyCompounding_2Y = (holdings * Math.pow((1 + (rewardRate / (52 * 100))), (52 * 2))) - holdings;
  const weeklyCompounding_3Y = (holdings * Math.pow((1 + (rewardRate / (52 * 100))), (52 * 3))) - holdings;
  const weeklyCompoundingRewards = new Array(weeklyCompounding / 365, weeklyCompounding / 52, weeklyCompounding / 12, weeklyCompounding, weeklyCompounding_2Y, weeklyCompounding_3Y);
  $("#weeklyCompoundingDay").text(numeral(weeklyCompoundingRewards[0]).format("0.00") + " ICX");
  $("#weeklyCompoundingWeek").text(numeral(weeklyCompoundingRewards[1]).format("0.00") + " ICX");
  $("#weeklyCompoundingMonth").text(numeral(weeklyCompoundingRewards[2]).format("0.00") + " ICX");
  $("#weeklyCompounding1Year").text(numeral(weeklyCompoundingRewards[3]).format("0.00") + " ICX");
  $("#weeklyCompounding2Year").text(numeral(weeklyCompoundingRewards[4]).format("0.00") + " ICX");
  $("#weeklyCompounding3Year").text(numeral(weeklyCompoundingRewards[5]).format("0.00") + " ICX");

  //Daily Compounding rewards
  const dailyCompounding = (holdings * Math.pow((1 + (rewardRate / (365 * 100))), (365 * 1))) - holdings;
  const dailyCompounding_2Y = (holdings * Math.pow((1 + (rewardRate / (365 * 100))), (365 * 2))) - holdings;
  const dailyCompounding_3Y = (holdings * Math.pow((1 + (rewardRate / (365 * 100))), (365 * 3))) - holdings;
  const dailyCompoundingRewards = new Array(dailyCompounding / 365, dailyCompounding / 52, dailyCompounding / 12, dailyCompounding, dailyCompounding_2Y, dailyCompounding_3Y);
  $("#dailyCompoundingDay").text(numeral(dailyCompoundingRewards[0]).format("0.00") + " ICX");
  $("#dailyCompoundingWeek").text(numeral(dailyCompoundingRewards[1]).format("0.00") + " ICX");
  $("#dailyCompoundingMonth").text(numeral(dailyCompoundingRewards[2]).format("0.00") + " ICX");
  $("#dailyCompounding1Year").text(numeral(dailyCompoundingRewards[3]).format("0.00") + " ICX");
  $("#dailyCompounding2Year").text(numeral(dailyCompoundingRewards[4]).format("0.00") + " ICX");
  $("#dailyCompounding3Year").text(numeral(dailyCompoundingRewards[5]).format("0.00") + " ICX");

  $("#result").show();
}
