document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("marketSearch");
    const searchButton = document.getElementById("marketSearchBtn");

    const areaFilter = document.getElementById("areaFilter");
    const dayFilter = document.getElementById("dayFilter");
    const produceFilter = document.getElementById("produceFilter");
    const sortMarkets = document.getElementById("sortMarkets");

    const clearFilters = document.getElementById("clearFilters");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    const marketDirectory = document.getElementById("marketDirectory");
    const resultCount = document.getElementById("marketResultCount");
    const noMarketsFound = document.getElementById("noMarketsFound");

    if (!marketDirectory) {
        return;
    }

    const originalCards = Array.from(
        marketDirectory.querySelectorAll(".market-card")
    );

    function filterMarkets() {

        const searchText = searchInput.value.trim().toLowerCase();
        const selectedArea = areaFilter.value;
        const selectedDay = dayFilter.value;
        const selectedProduce = produceFilter.value;

        let visibleCards = [];

        originalCards.forEach(function (card) {

            const name = (card.dataset.name || "").toLowerCase();
            const area = (card.dataset.area || "").toLowerCase();
            const day = (card.dataset.day || "").toLowerCase();
            const produce = (card.dataset.produce || "").toLowerCase();

            const descriptionElement =
                card.querySelector(".market-description");

            const description = descriptionElement
                ? descriptionElement.textContent.toLowerCase()
                : "";

            const searchMatch =
                searchText === "" ||
                name.includes(searchText) ||
                area.includes(searchText) ||
                produce.includes(searchText) ||
                description.includes(searchText);

            const areaMatch =
                selectedArea === "all" ||
                area === selectedArea.toLowerCase();

            const dayMatch =
                selectedDay === "all" ||
                day === selectedDay.toLowerCase();

            const produceMatch =
                selectedProduce === "all" ||
                produce.includes(selectedProduce.toLowerCase());

            if (
                searchMatch &&
                areaMatch &&
                dayMatch &&
                produceMatch
            ) {
                card.style.display = "";
                visibleCards.push(card);
            } else {
                card.style.display = "none";
            }
        });

        sortVisibleCards(visibleCards);

        updateResultCount(visibleCards.length);

        if (visibleCards.length === 0) {
            noMarketsFound.style.display = "block";
        } else {
            noMarketsFound.style.display = "none";
        }
    }


    function sortVisibleCards(cards) {

        const sortValue = sortMarkets.value;

        if (sortValue === "default") {
            cards.forEach(function (card) {
                marketDirectory.appendChild(card);
            });

            return;
        }

        if (sortValue === "name") {

            cards.sort(function (a, b) {

                const nameA = (a.dataset.name || "").toLowerCase();
                const nameB = (b.dataset.name || "").toLowerCase();

                return nameA.localeCompare(nameB);
            });

        }

        if (sortValue === "next") {

            const days = {
                "monday": 1,
                "tuesday": 2,
                "wednesday": 3,
                "thursday": 4,
                "friday": 5,
                "saturday": 6,
                "sunday": 7
            };

            cards.sort(function (a, b) {

                const dayA = days[
                    (a.dataset.day || "").toLowerCase()
                ] || 99;

                const dayB = days[
                    (b.dataset.day || "").toLowerCase()
                ] || 99;

                return dayA - dayB;
            });
        }

        cards.forEach(function (card) {
            marketDirectory.appendChild(card);
        });
    }


    function updateResultCount(count) {

        if (resultCount) {
            resultCount.textContent = count;
        }
    }


    function clearAllFilters() {

        searchInput.value = "";

        areaFilter.value = "all";
        dayFilter.value = "all";
        produceFilter.value = "all";
        sortMarkets.value = "default";

        originalCards.forEach(function (card) {
            card.style.display = "";
            marketDirectory.appendChild(card);
        });

        updateResultCount(originalCards.length);

        noMarketsFound.style.display = "none";
    }


    if (searchButton) {
        searchButton.addEventListener("click", function () {
            filterMarkets();
        });
    }


    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterMarkets();
        });

        searchInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                filterMarkets();
            }

        });
    }


    if (areaFilter) {
        areaFilter.addEventListener("change", function () {
            filterMarkets();
        });
    }


    if (dayFilter) {
        dayFilter.addEventListener("change", function () {
            filterMarkets();
        });
    }


    if (produceFilter) {
        produceFilter.addEventListener("change", function () {
            filterMarkets();
        });
    }


    if (sortMarkets) {
        sortMarkets.addEventListener("change", function () {
            filterMarkets();
        });
    }


    if (clearFilters) {
        clearFilters.addEventListener("click", function () {
            clearAllFilters();
        });
    }


    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", function () {
            clearAllFilters();
        });
    }


    updateResultCount(originalCards.length);

});