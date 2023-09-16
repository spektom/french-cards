(function () {
    const colors = ["#22AF4B", "#1E8BC3", "#D91E18", "#D35400", "#8E44AD", "#C0392B", "#0F89CA"];

    const speechEngine = new SpeechSynthesisUtterance();
    speechEngine.lang = 'fr-FR';

    var muted;
    var activities;
    var activityCards;
    var currentCard;
    var currentSentence;

    function initialize() {
        loadPreferences();
        loadActivities();
        $("#activities").on("change", selectActivity);
        $("#prevButton").on("click", function() { openSentence(-1) });
        $("#nextButton").on("click", function() { openSentence(1) });
        $("#speakerButton").on("click", toggleSpeakerButton);
        updateSpeakerButton(muted);
    }

    function loadPreferences() {
        muted = localStorage.getItem("muted") == "true";
    }

    function savePreferences() {
        localStorage.setItem("muted", muted);
    }

    function shuffleArray(a, b, c, d) { c = a.length; while (c) b = Math.random() * (--c + 1) | 0, d = a[c], a[c] = a[b], a[b] = d }

    function loadActivities() {
        $.getJSON("data/activities.json", function (data) {
            activities = data;
            const $activities = $("#activities");
            $.each(activities, function (name) {
                $activities.append($("<option />").text(name).val(name));
            });
            selectActivity();
        });
    }

    function selectActivity() {
        const activity = $("#activities option:selected").val();
        activityCards = activities[activity].slice(0);
        shuffleArray(activityCards);
        currentSentence = 0;
        openSentence();
    }

    function openSentence(increment = 0) {
        currentSentence += increment;
        if (currentSentence < 0) { currentSentence = activityCards.length -1; }
        else if (currentSentence >= activityCards.length) { currentSentence = 0 ; }
        
        currentCard = 0;
        $("#cardsPanel").empty();
        $("#cardsPanel").append($('<div id="card0" class="card"/>').append(
            $('<div class="cardText"/>').text(activityCards[currentSentence][0])));
        $("#cardsPanel").append($('<div id="card1" class="card"/>').append(
            $('<div class="cardText"/>').text(activityCards[currentSentence][1])));
        $("#card0").css("background-color", colors[Math.floor(Math.random() * colors.length)]);
        $("#card1").css("background-color", "#34495E");
        $("#card1").css("top", "200px");
        $("#cardsPanel").off("click").on("click", function () {
            hideCard(currentCard);
            currentCard = (currentCard + 1) % 2;
            showCard(currentCard);
        });
        speakCard();
    }

    function hideCard(cardNum) {
        const $card = $("#card" + cardNum);
        $card.animate({ top: "-=200" }, 150, function () { $card.css("top", "200px"); });
    }

    function showCard(cardNum) {
        const $card = $("#card" + cardNum);
        $card.animate({ top: "-=200" }, 150);
        if (cardNum == 0) { speakCard(); }
    }

    function updateSpeakerButton(muted) {
        if (muted) { $("#speakerButton").addClass("muted"); }
        else { $("#speakerButton").removeClass("muted"); }
    }

    function toggleSpeakerButton() {
        muted = !muted;
        updateSpeakerButton(muted);
        savePreferences();
        if (!muted) {
            speakCard();
        }
    }

    function speakCard() {
        if (!muted) {
            var text = $("#card0").text()
            text = text.replace('-', '‑'); // non-breaking hyphen
            speechEngine.text = text;
            window.speechSynthesis.speak(speechEngine);
        }
    }

    initialize();
})();