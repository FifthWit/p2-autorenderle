const apiBase = "https://autorender.portal2.sr/api/v1";
const boardsBase = "https://board.portal2.sr";

var boardJson = null;
var randomRank = null;
var runID = null;
var trueRank = null;
var filterMode = 0;

function reset() {
    // Get a random map ID from maplist.js
    if(filterMode == 0) {
        var randomMap = Math.floor(Math.random() * 108) + 1;
    } else if(filterMode == 1) {
        var randomMap = Math.floor(Math.random() * 60) + 1;
    } else if(filterMode == 2) {
        var randomMap = Math.floor(Math.random() * 48) + 61;
    }
    var mapID = mapsJson[randomMap - 1].mapid;

    // Get the boards JSON
    $.getJSON(boardsBase + "/chamber/" + mapID + "/json", function(data) {
        boardJson = data;
        console.log(boardJson);
    }).then(function() {
        function rankGenerateRunID() {
            // Generate a random rank between 1 and 200 (slightly broken)
            randomRank = Math.floor(Math.random() * 200);
            trueRank = randomRank +1 ;

            // Get the run ID from boards api
            runID = boardJson[Object.keys(boardJson)[randomRank]].scoreData.changelogId;
            var previousRunID = null;
            if(previousRunID == runID) {
                console.error("Duplicate run, generating new run ID");
                rankGenerateRunID();
            }
            previousRunID = runID;
            
            // Check if the run ID has a valid demo
            if(boardJson[Object.keys(boardJson)[randomRank]].scoreData.hasDemo == 0) {
                console.error("Run ID has no demo, generating new run ID");
                rankGenerateRunID();
            }
        }

        // Generate the run ID
        rankGenerateRunID();

        // Display autorender
        var videoPlayer = document.getElementById("videoPlayer");
        videoPlayer.src = apiBase + "/video/" + runID + "/video";
        document.getElementById("rank-guess").value = "";

        // Reset timer
        clearInterval(Interval);
        tens = "00";
        seconds = "00";

        // Start timer
        clearInterval(Interval);
        Interval = setInterval(startTimer, 10);

        // Set buttons to work again
        document.getElementById("rank-guess").disabled = false;
        document.getElementById("rank-submit").disabled = false;
        document.getElementById("skip").disabled = false;
    });
}

// Start the loop initially
reset();

// Handle Runner Guesses
var rankStreak = 0;
var highscore = localStorage.getItem("rank-highscore") || 0;

// Timer
var seconds = 0;
var tens = 0;
var Interval;
function startTimer () {
    tens++; 
    if (tens > 99) {
        seconds++;
        tens = 0;
    }
}

function rankSubmitGuess() {
    document.getElementById("rank-guess").disabled = true;
    document.getElementById("rank-submit").disabled = true;
    document.getElementById("skip").disabled = true;

    var submitText = document.getElementById("rank-guess");
    // Check if guess is correct by margins
    if(submitText.value == trueRank) {
        rankStreak++;
        if(rankStreak > highscore) {
            highscore = rankStreak;
            localStorage.setItem("runner-highscore", highscore);
        }
        document.getElementById("game-output").innerHTML = "Exactly right! This run is placed " + trueRank + "!";
        document.getElementById("endgame-container").style.borderColor = "green";
    } else if(trueRank - 10 <= submitText.value && submitText.value <= trueRank + 10) {
        rankStreak++;
        if(rankStreak > highscore) {
            highscore = rankStreak;
            localStorage.setItem("runner-highscore", highscore);
        }
        document.getElementById("game-output").innerHTML = "You were within 10! This run is placed " + trueRank + "!";
        document.getElementById("endgame-container").style.borderColor = "gold";
    } else if(trueRank - 20 <= submitText.value && submitText.value <= trueRank + 20) {
        rankStreak = 0;
        document.getElementById("game-output").innerHTML = "You are within 20 places. This run is placed " + trueRank + ".";
        document.getElementById("endgame-container").style.borderColor = "goldenrod";
        document.getElementById("gameoutput-3").innerHTML = "Streak: 0";
    } else {
        rankStreak = 0;
        document.getElementById("game-output").innerHTML = "Incorrect. This run is placed " + trueRank + ".";
        document.getElementById("endgame-container").style.borderColor = "rgba(222,0,0)";
        document.getElementById("gameoutput-3").innerHTML = "Streak: 0";
    }
    document.getElementById("gameoutput-1").innerHTML = "This run is ran by " + boardJson[Object.keys(boardJson)[randomRank]].userData.boardname;
    document.getElementById("gameoutput-2").innerHTML = "You made this guess in " + seconds + "." + tens + " seconds";
    document.getElementById("gameoutput-3").innerHTML = "Streak: " + rankStreak;
    document.getElementById("gameoutput-4").innerHTML = "High-score streak: " + highscore;
    document.querySelector(".endgame-container").classList.toggle("hidden");
}
function playAgain() {
    document.querySelector(".endgame-container").classList.toggle("hidden");
    reset();
}

// Info page stuff
function openCloseInfo() {
    document.querySelector(".info-container").classList.toggle("hidden");
    if(document.querySelector(".info-container").classList.contains("hidden")) {
        document.getElementById("rank-guess").disabled = false;
        document.getElementById("rank-submit").disabled = false;
        document.getElementById("skip").disabled = false;
    } else {
        document.getElementById("rank-guess").disabled = true;
        document.getElementById("rank-submit").disabled = true;
        document.getElementById("skip").disabled = true;
    }
}

// Change filter
function changeFilter(filter) {
    if(filter == "all") {
        rankStreak = 0;
        filterMode = 0;
        document.getElementById("streak-text").innerHTML = "Streak: " + rankStreak;
        reset();
    } else if(filter == "sp") {
        rankStreak = 0;
        filterMode = 1;
        document.getElementById("streak-text").innerHTML = "Streak: " + rankStreak;
        reset();
    }
    else if(filter == "coop") {
        rankStreak = 0;
        filterMode = 2;
        document.getElementById("streak-text").innerHTML = "Streak: " + rankStreak;
        reset();
    }
}

function skip() {
    if(confirm("Skip this run? (Meant only for broken demos)")) {
        reset();
    }
}