function fetchIconNetworkData() {
  axios.get("https://tracker.icon.foundation/v0/main/mainInfo").then(function (mainInfoResponse) {
    const totalSupply = mainInfoResponse.data.tmainInfo.icxSupply;
    const circulatingSupply = mainInfoResponse.data.tmainInfo.icxCirculationy;
    const marketCap = mainInfoResponse.data.tmainInfo.marketCap;

    console.log("Total Supply: " + totalSupply + " ICX");
    console.log("Circulating Supply: " + circulatingSupply + " ICX");
    console.log("MarketCap: " + marketCap + " USD");

    axios.get("https://tracker.icon.foundation/v3/iiss/prep/list?count=1").then(function (prepListResponse) {
      const stakedSupply = prepListResponse.data.data[0].totalStake;

      console.log("Staked Supply: " + stakedSupply + " ICX");

      const staked = stakedSupply / totalSupply * 100;

      $("#staked").val(numeral(staked).format("0.00"));
    })
  })
}

function calculate() {
  const r_min = 0.02, r_max = 0.12, r_point = 0.7;

  let staked = $("#staked").val();
  if(staked >= 70) staked = 70;

  const r_rep = ((r_max-r_min) / (r_point ** 2)) * ((staked / 100) - r_point) ** 2 + r_min;
  const roi = (r_rep * 100 * 3).toFixed(2); // Assuming same delegation rates for other two sectors, hence * 3

  const holdings = $("#holdings").val();
  const rewards = holdings * (roi / 100);

  console.log(rewards + " ICX");
}