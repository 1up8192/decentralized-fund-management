pragma solidity ^0.4.18;


contract TraderRanking {
    
    mapping (address => TraderStats) Traders;
    
    struct TraderStats{
        int score;
        uint8 negativeStreak; //number of last consecutive negative trades (0 if last trade was positive)
    }
    
    uint summaryOfAllScores;

    function getMaxAvailableFunds(address user) public constant;
    
    function getMaxAvailableLength(address user) public constant;
    
    function calculateScore(address trader, int lastTradeProfit) internal { //lastTradeProfit can be nagative
        if(lastTradeProfit < 0){
            Traders[trader].negativeStreak += 1;
        } else {
            Traders[trader].negativeStreak = 0;
        }
        Traders[trader].score += lastTradeProfit * (Traders[trader].negativeStreak + 1);
    }
    
    function dismissTrader(address trader) private {
        delete Traders[trader].score;
        delete Traders[trader].negativeStreak;
    }
    
    function addTrader(address trader) private {
        Traders[trader].score = 1;
        summaryOfAllScores += 1;
    }
    
}
