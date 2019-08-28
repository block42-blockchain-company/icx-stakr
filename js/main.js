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

      // Do some fun
    })
  })
}