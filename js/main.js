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

      axios.get("https://api.coinpaprika.com/v1/coins/icx-icon/ohlcv/today").then(function (coinpaprikaResponse) {
        const icxPrice = coinpaprikaResponse.data[0].close;

        data["icxPrice"] = icxPrice;

        $("#staked").text(numeral((stakedSupply / totalSupply) * 100).format("0.00") + " %");
        $("#voted").text(numeral((delegatedSupply / totalSupply) * 100).format("0.00") + " %");
        $("#reward-rate").text(numeral(getRewardRate()).format("0.00") + " %");
        $("#un-staking-period").text("~" + numeral(getUnStakingPeriod()).format("0") + " days");
      });
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

  // Check if input is valid
  if (holdings <= 0) {
    $("#holdings").addClass("is-invalid");
    return
  }

  // Remove invalid validation style (if there is any applied)
  $("#holdings").removeClass("is-invalid");

  const rewardRate = getRewardRate();

  // OneTime staking rewards
  const oneTime = holdings * (rewardRate / 100);
  const oneTimeStakingRewards = [ oneTime / 365, oneTime / 52, oneTime / 12, oneTime, oneTime * 2, oneTime * 3 ];
  $("#oneTimeStaking1Year-icx").text("~" + numeral(oneTimeStakingRewards[3]).format("0,0.00") + " ICX (± 0.00 %)");
  $("#oneTimeStaking2Year-icx").text("~" + numeral(oneTimeStakingRewards[4]).format("0,0.00") + " ICX (± 0.00 %)");
  $("#oneTimeStaking3Year-icx").text("~" + numeral(oneTimeStakingRewards[5]).format("0,0.00") + " ICX (± 0.00 %)");
  $("#oneTimeStaking1Year-usd").text("$ " + numeral(oneTimeStakingRewards[3] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#oneTimeStaking2Year-usd").text("$ " + numeral(oneTimeStakingRewards[4] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#oneTimeStaking3Year-usd").text("$ " + numeral(oneTimeStakingRewards[5] * data["icxPrice"]).format("0,0.00") + " USD");

  // Monthly compounding rewards
  const monthlyCompounding = holdings * ((1 + (rewardRate / (12 * 100))) ** 12) - holdings;
  const monthlyCompounding_2Y = holdings * ((1 + (rewardRate / (12 * 100))) ** (12 * 2)) - holdings;
  const monthlyCompounding_3Y = holdings * ((1 + (rewardRate / (12 * 100))) ** (12 * 3)) - holdings;
  const monthlyCompoundingRewards = [ monthlyCompounding, monthlyCompounding_2Y, monthlyCompounding_3Y ];
  $("#monthlyCompounding1Year-icx").text("~" + numeral(monthlyCompoundingRewards[0]).format("0,0.00") + " ICX (+ " + numeral((monthlyCompoundingRewards[0] / oneTimeStakingRewards[3] - 1) * 100).format("0.00") + " %)");
  $("#monthlyCompounding2Year-icx").text("~" + numeral(monthlyCompoundingRewards[1]).format("0,0.00") + " ICX (+ " + numeral((monthlyCompoundingRewards[1] / oneTimeStakingRewards[4] - 1) * 100).format("0.00") + " %)");
  $("#monthlyCompounding3Year-icx").text("~" + numeral(monthlyCompoundingRewards[2]).format("0,0.00") + " ICX (+ " + numeral((monthlyCompoundingRewards[2] / oneTimeStakingRewards[5] - 1) * 100).format("0.00") + " %)");
  $("#monthlyCompounding1Year-usd").text("$ " + numeral(monthlyCompoundingRewards[0] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#monthlyCompounding2Year-usd").text("$ " + numeral(monthlyCompoundingRewards[1] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#monthlyCompounding3Year-usd").text("$ " + numeral(monthlyCompoundingRewards[2] * data["icxPrice"]).format("0,0.00") + " USD");

  // Weekly compounding rewards
  const weeklyCompounding = holdings * ((1 + (rewardRate / (52 * 100))) ** 52) - holdings;
  const weeklyCompounding_2Y = holdings * ((1 + (rewardRate / (52 * 100))) ** (52 * 2)) - holdings;
  const weeklyCompounding_3Y = holdings * ((1 + (rewardRate / (52 * 100))) ** (52 * 3)) - holdings;
  const weeklyCompoundingRewards = [ weeklyCompounding, weeklyCompounding_2Y, weeklyCompounding_3Y ];
  $("#weeklyCompounding1Year-icx").text("~" + numeral(weeklyCompoundingRewards[0]).format("0,0.00") + " ICX (+ " + numeral((weeklyCompoundingRewards[0] / oneTimeStakingRewards[3] - 1) * 100).format("0.00") + " %)");
  $("#weeklyCompounding2Year-icx").text("~" + numeral(weeklyCompoundingRewards[1]).format("0,0.00") + " ICX (+ " + numeral((weeklyCompoundingRewards[1] / oneTimeStakingRewards[4] - 1) * 100).format("0.00") + " %)");
  $("#weeklyCompounding3Year-icx").text("~" + numeral(weeklyCompoundingRewards[2]).format("0,0.00") + " ICX (+ " + numeral((weeklyCompoundingRewards[2] / oneTimeStakingRewards[5] - 1) * 100).format("0.00") + " %)");
  $("#weeklyCompounding1Year-usd").text("$ " + numeral(weeklyCompoundingRewards[0] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#weeklyCompounding2Year-usd").text("$ " + numeral(weeklyCompoundingRewards[1] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#weeklyCompounding3Year-usd").text("$ " + numeral(weeklyCompoundingRewards[2] * data["icxPrice"]).format("0,0.00") + " USD");

  // Daily Compounding rewards
  const dailyCompounding = holdings * ((1 + (rewardRate / (365 * 100))) ** 365) - holdings;
  const dailyCompounding_2Y = holdings * ((1 + (rewardRate / (365 * 100))) ** (365 * 2)) - holdings;
  const dailyCompounding_3Y = holdings * ((1 + (rewardRate / (365 * 100))) ** (365 * 3)) - holdings;
  const dailyCompoundingRewards = [ dailyCompounding, dailyCompounding_2Y, dailyCompounding_3Y ];
  $("#dailyCompounding1Year-icx").text("~" + numeral(dailyCompoundingRewards[0]).format("0,0.00") + " ICX (+ " + numeral((dailyCompoundingRewards[0] / oneTimeStakingRewards[3] - 1) * 100).format("0.00") + " %)");
  $("#dailyCompounding2Year-icx").text("~" + numeral(dailyCompoundingRewards[1]).format("0,0.00") + " ICX (+ " + numeral((dailyCompoundingRewards[1] / oneTimeStakingRewards[4] - 1) * 100).format("0.00") + " %)");
  $("#dailyCompounding3Year-icx").text("~" + numeral(dailyCompoundingRewards[2]).format("0,0.00") + " ICX (+ " + numeral((dailyCompoundingRewards[2] / oneTimeStakingRewards[5] - 1) * 100).format("0.00") + " %)");
  $("#dailyCompounding1Year-usd").text("$ " + numeral(dailyCompoundingRewards[0] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#dailyCompounding2Year-usd").text("$ " + numeral(dailyCompoundingRewards[1] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#dailyCompounding3Year-usd").text("$ " + numeral(dailyCompoundingRewards[2] * data["icxPrice"]).format("0,0.00") + " USD");

  // ICX Rewards
  $("#rewards-daily-icx").text("~" + numeral(oneTimeStakingRewards[0]).format("0,0.00") + " ICX");
  $("#rewards-weekly-icx").text("~" + numeral(oneTimeStakingRewards[1]).format("0,0.00") + " ICX");
  $("#rewards-monthly-icx").text("~" + numeral(oneTimeStakingRewards[2]).format("0,0.00") + " ICX");
  $("#rewards-yearly-icx").text("~" + numeral(oneTimeStakingRewards[3]).format("0,0.00") + " ICX");

  // USD Rewards
  $("#rewards-daily-usd").text("$ " + numeral(oneTimeStakingRewards[0] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#rewards-weekly-usd").text("$ " + numeral(oneTimeStakingRewards[1] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#rewards-monthly-usd").text("$ " + numeral(oneTimeStakingRewards[2] * data["icxPrice"]).format("0,0.00") + " USD");
  $("#rewards-yearly-usd").text("$ " + numeral(oneTimeStakingRewards[3] * data["icxPrice"]).format("0,0.00") + " USD");

  // Track calculation
  if (window.location.hostname !== "localhost") {
    ga("send", "event", "Calculator", "Click", "", holdings);
  }

  // Show section
  $("#result").show();

  // Scroll to result section
  $('html, body').animate({ scrollTop: $("#result").offset().top }, 500);
}

function redirect(){
  window.open(
      "http://bit.ly/ICONxMyCointainer",
      "_blank"
  )
}
