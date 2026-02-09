const API_URL = "https://sb-film.skillbox.cc/films";
const EMAIL = "melfive@mail.ru";

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => {
        el.style.display = "none";
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const formEl = document.querySelector("#film-form");

    clearErrors();

    const title = formEl.querySelector("#title").value;
    const genre = formEl.querySelector("#genre").value;
    const releaseYear = formEl.querySelector("#releaseYear").value;
    const isWatched = formEl.querySelector("#isWatched").checked;

    let isValid = true;

    if (!title.trim()) {
        formEl.querySelector("#title-error").style.display = "block";
        isValid = false;
    };

    if (!genre.trim()) {
        formEl.querySelector("#genre-error").style.display = "block";
        isValid = false;
    };

    if (!releaseYear.trim() || isNaN(releaseYear.trim())) {
        formEl.querySelector("#releaseYear-error").style.display = "block";
        isValid = false;
    };

    const year = Number(releaseYear.trim());
    const currentYear = new Date().getFullYear();

    if (isNaN(year) || year < 1900 || year > currentYear) {
        formEl.querySelector("#releaseYear-error").style.display = "inline-block";
        isValid = false;
    }

    if (!isValid) {
        return;
    };

    const film = {
        title: title.trim(),
        genre: genre.trim(),
        releaseYear: releaseYear.trim(),
        isWatched,
    };

    await addFilmToServer(film);

    formEl.reset();

    clearErrors();
};

async function addFilmToServer(film) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "email": EMAIL
        },
        body: JSON.stringify(film)
    });
    await renderTable();
};

async function renderTable() {
    console.log("=== renderTable вызван ===");
    console.log("Время:", new Date().toLocaleTimeString());

    const response = await fetch(API_URL, {
        headers: {
            email: EMAIL,
        }
    });

    let films = await response.json();

    const titleFilter = document.querySelector("#filter-title").value.trim();
    const genreFilter = document.querySelector("#filter-genre").value.trim();
    const yearFilter = document.querySelector("#filter-year").value.trim();
    const watchedFilter = document.querySelector("#filter-is-watched").value;

    console.log("Фильтры:");
    console.log("Название:", titleFilter);
    console.log("Жанр:", genreFilter);
    console.log("Год:", yearFilter);
    console.log("Просмотрен:", watchedFilter);

    if (titleFilter) {
        films = films.filter(film => film.title.toLowerCase().includes(titleFilter.toLowerCase())
        );
    }

    if (genreFilter) {
        films = films.filter(film => film.genre.toLowerCase().includes(genreFilter.toLowerCase())
        );
    }

    if (yearFilter) {
        films = films.filter(film => film.releaseYear.toString().includes(yearFilter)
        );
    }

    if (watchedFilter === "true") {
        films = films.filter(film => film.isWatched === true);
    } else if (watchedFilter === "false") {
        films = films.filter(film => film.isWatched === false);
    }

    const filmTableBody = document.querySelector("#film-tbody");
    filmTableBody.innerHTML = "";

    films.forEach(film => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${film.title}</td>
        <td>${film.genre}</td>
        <td>${film.releaseYear}</td>
        <td>${film.isWatched ? "Да" : "Нет"}</td>
        `;

        const actionCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.textContent = "Удалить";

        removeButton.addEventListener("click", async () => {
            await fetch(`${API_URL}/${film.id}`, {
                method: "DELETE",
                headers: {
                    email: EMAIL
                }
            });

            await renderTable();
        });

        actionCell.appendChild(removeButton);
        row.appendChild(actionCell);

        filmTableBody.appendChild(row);
    });
};

document.querySelector("#filter-title").addEventListener("input", renderTable);
document.querySelector("#filter-genre").addEventListener("input", renderTable);
document.querySelector("#filter-year").addEventListener("input", renderTable);
document.querySelector("#filter-is-watched").addEventListener("change", renderTable);

document.querySelector("#delete-all").addEventListener("click", async () => {
    await fetch(API_URL, {
        method: "DELETE",
        headers: {
            email: EMAIL
        }
    });

    document.querySelector("#filter-title").value = "";
    document.querySelector("#filter-genre").value = "";
    document.querySelector("#filter-year").value = "";
    document.querySelector("#filter-is-watched").value = "";

    await renderTable();
});

document.querySelector("#film-form").addEventListener("submit", handleFormSubmit);

renderTable();