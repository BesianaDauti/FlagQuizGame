document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path.includes("index.html") || path.endsWith("/")) {
        const startBtn = document.querySelector(".start-btn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                window.location.href = "continent.html";
            });
        }
    }

    if (path.includes("continent.html")) {
        const backBtn = document.querySelector(".back-btn");
        const continentBtns = document.querySelectorAll(".continent-btn");

        if (backBtn) backBtn.addEventListener("click", () => window.location.href = "index.html");

        continentBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                let continent = btn.textContent.trim().toLowerCase();
                if (continent.includes("all")) continent = "all";
                else continent = continent.replace(" ", "-");

                sessionStorage.setItem("continent", continent);
                window.location.href = "level.html";

            });
        });
    }

    if (path.includes("level.html")) {
        const backBtn = document.querySelector(".back-btn1");
        const levelBtns = document.querySelectorAll(".level-btn");

        if (backBtn) backBtn.addEventListener("click", () => window.location.href = "continent.html");

        levelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const level = btn.textContent.split(" ")[0];
                sessionStorage.setItem("level", level);
                window.location.href = "game.html";
            });
        });
    }

    if (path.includes("game.html")) {
        const flagImage = document.querySelector("#flag");
        const optionBtns = document.querySelectorAll(".option-btn");
        const timerDisplay = document.querySelector(".timer");
        const nextBtn = document.querySelector(".next-btn");
        const pauseBtn = document.querySelector(".pause-btn");
        const modal = document.querySelector(".modal");
        const resumeBtn = document.querySelector(".resume-btn");
        const restartBtn = document.querySelector(".restart-btn");
        const homeBtn = document.querySelector(".home-btn");

        let allFlags = [];
        let correctCountry = "";
        let score = 0;
        let timer;
        let timeLeft;

        let continent = sessionStorage.getItem("continent");
        if (!continent) {
            continent = "all";
            sessionStorage.setItem("continent", "all");
        }

        const level = sessionStorage.getItem("level") || "Easy";

        if (level === "Easy") timeLeft = 180;
        else if (level === "Medium") timeLeft = 120;
        else timeLeft = 90;

        timerDisplay.textContent = `⏱️ ${timeLeft}s`;

        function startTimer() {
            timer = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = `⏱️ ${timeLeft}s`;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timer);
        }

        async function loadFlagsFromAPI() {
            const loader = document.getElementById("loader");
            loader.style.display = "flex";
            //console.log("Continent being fetched:", continent);

            try {
                const apiUrl = `/api/flags/${continent}`;
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                const data = await res.json();

                if (!data || data.length < 4) throw new Error("Not enougj flags.");

                allFlags = [...data];
                loadNextFlag();
                loader.style.display = "none";
                startTimer();
            } catch (err) {
                alert("Something went wrong!Please try again later");
            }
        }

        let shownFlags = [];
        let gameOver = false;

        function loadNextFlag() {
            const remainingFlags = allFlags.filter(f => !shownFlags.includes(f.name));

            if (remainingFlags.length === 0) {
                finishGame("🥳 You guessed all the flags!", score);
                return;
            }

            const correct = remainingFlags[Math.floor(Math.random() * remainingFlags.length)];
            correctCountry = correct.name;

            flagImage.src = correct.flag;

            shownFlags.push(correct.name);

            const randomOptions = allFlags
                .filter(f => f.name !== correct.name) 
                .sort(() => 0.5 - Math.random())       
                .slice(0, 3);                          

            const options = [...randomOptions, correct].sort(() => 0.5 - Math.random());

            optionBtns.forEach((btn, i) => {
                const opt = options[i];
                btn.textContent = opt ? opt.name : ""; 
                btn.disabled = !opt;
                btn.style.backgroundColor = "";
                if (opt) {
                    btn.onclick = () => checkAnswer(opt.name, btn);
                } else {
                    btn.onclick = null;
                }
            });
        }

        function checkAnswer(selected, btnElement) {
            optionBtns.forEach(btn => btn.disabled = true);

            if (selected === correctCountry) {
                score++;
                btnElement.style.backgroundColor = "green";
                setTimeout(() => {
                    loadNextFlag();
                }, 500);
            } else {
                btnElement.style.backgroundColor = "red";
                optionBtns.forEach(btn => {
                    if (btn.textContent === correctCountry) btn.style.backgroundColor = "green";
                });
                setTimeout(() => {
                    loadNextFlag();
                }, 500);
            }
        }

        nextBtn.addEventListener("click", () => loadNextFlag());

        pauseBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
            stopTimer();
        });

        resumeBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
            startTimer();
        });

        restartBtn.addEventListener("click", () => location.reload());
        homeBtn.addEventListener("click", () => window.location.href = "index.html");

        async function endGame() {
            stopTimer();
            const playerName = "Anonymous";
            const continent = sessionStorage.getItem("continent") || "all";
            const level = sessionStorage.getItem("level") || "Easy";
            const finalScore = score; 
            alert(`⏰ Time's up!\n Your score: ${score}`);

            try {
                await fetch("/api/results",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(
                            {
                                PlayerName: playerName,
                                Continent: continent,
                                Level: level,
                                Score: finalScore
                            })
                    });
            } catch (err) {
                console.error("Error saving score:", err);
            }
            window.location.href = "index.html";
        }

        async function finishGame(message, finalScore) {
            if (gameOver) return;
            gameOver = true;

            stopTimer();

            alert(`${message}\nYour final score: ${finalScore}`);
            sessionStorage.setItem("highscore", finalScore);

            const playerName = "Anonymous";
            const continent = sessionStorage.getItem("continent") || "all";
            const level = sessionStorage.getItem("level") || "Easy";

            try
            {
                await fetch("/api/results",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(
                            {
                                PlayerName: playerName,
                                Continent: continent,
                                Level: level,
                                Score: finalScore
                            })
                    });
            } catch (err)
            {
                console.error("Error saving score:", err);
            }
            window.location.href = "index.html";
        }
        loadFlagsFromAPI();
        //startTimer();
    }
})