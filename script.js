const bikes = document.querySelectorAll(".bike");
const cartBox = document.querySelector("#cart-items");

let cart = JSON.parse(localStorage.getItem("velox-cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("velox-fav") || "[]");

let favMode = false;

function priceText(price) {
    return Number(price).toLocaleString("en-US") + " ₽";
}

function save() {
    localStorage.setItem("velox-cart", JSON.stringify(cart));
    localStorage.setItem("velox-fav", JSON.stringify(favorites));
}

function toast(text) {
    const box = document.querySelector("#toast");

    box.textContent = text;
    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 2000);
}

/* CART */

function drawCart() {
    cartBox.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(item => {
        const bike = document.querySelector('.bike[data-id="' + item.id + '"]');

        if (!bike) return;

        const name = bike.dataset.name;
        const price = Number(bike.dataset.price);
        const img = bike.querySelector("img").src;

        total += price * item.qty;
        count += item.qty;

        cartBox.innerHTML += `
            <div class="cart-row" data-id="${item.id}">
                <img src="${img}" alt="${name}">

                <div>
                    <h4>${name}</h4>
                    <p>${priceText(price)}</p>

                    <div class="quantity">
                        <button class="minus">−</button>
                        <span>${item.qty}</span>
                        <button class="plus">+</button>
                    </div>
                </div>

                <button class="remove">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    if (cart.length === 0) {
        cartBox.innerHTML = '<p class="empty">Your bag is empty.</p>';
    }

    document.querySelector("#count").textContent = count;
    document.querySelector("#cart-total").textContent = priceText(total);

    save();
}

/* ADD TO CART */

document.querySelectorAll(".add").forEach(button => {
    button.addEventListener("click", () => {
        const bike = button.closest(".bike");
        const id = Number(bike.dataset.id);

        let found = false;

        cart.forEach(item => {
            if (item.id === id) {
                item.qty++;
                found = true;
            }
        });

        if (!found) {
            cart.push({
                id: id,
                qty: 1
            });
        }

        drawCart();
        toast("Added to your bag");
    });
});

/* CART BUTTONS */

cartBox.addEventListener("click", event => {
    const row = event.target.closest(".cart-row");

    if (!row) return;

    const id = Number(row.dataset.id);

    if (event.target.closest(".plus")) {
        cart.forEach(item => {
            if (item.id === id) item.qty++;
        });
    }

    if (event.target.closest(".minus")) {
        cart.forEach(item => {
            if (item.id === id) item.qty--;
        });

        cart = cart.filter(item => item.qty > 0);
    }

    if (event.target.closest(".remove")) {
        cart = cart.filter(item => item.id !== id);
    }

    drawCart();
});

/* OPEN AND CLOSE CART */

function openCart() {
    document.querySelector("#cart").classList.add("show");
    document.querySelector("#overlay").classList.add("show");
    drawCart();
}

function closeCart() {
    document.querySelector("#cart").classList.remove("show");
    document.querySelector("#overlay").classList.remove("show");
}

document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
document.querySelector("#overlay").addEventListener("click", closeCart);

/* FAVORITES */

function drawFavorites() {
    bikes.forEach(bike => {
        const id = Number(bike.dataset.id);
        const button = bike.querySelector(".fav");
        const icon = button.querySelector("i");

        if (favorites.includes(id)) {
            button.classList.add("selected");
            icon.className = "fa-solid fa-heart";
        } else {
            button.classList.remove("selected");
            icon.className = "fa-regular fa-heart";
        }
    });
}

document.querySelectorAll(".fav").forEach(button => {
    button.addEventListener("click", () => {
        const bike = button.closest(".bike");
        const id = Number(bike.dataset.id);

        if (favorites.includes(id)) {
            favorites = favorites.filter(item => item !== id);
            toast("Removed from favorites");
        } else {
            favorites.push(id);
            toast("Added to favorites");
        }

        save();
        drawFavorites();
        filterBikes();
    });
});

document.querySelector("#fav-open").addEventListener("click", () => {
    favMode = !favMode;

    document.querySelector("#fav-open").classList.toggle("selected", favMode);

    filterBikes();

    document.querySelector("#shop").scrollIntoView({
        behavior: "smooth"
    });
});

/* FILTERS */

const checks = document.querySelectorAll(".check");

function filterBikes() {
    const search = document.querySelector("#search").value.toLowerCase();
    const maxPrice = Number(document.querySelector("#price").value);

    const selected = [];

    checks.forEach(check => {
        if (check.checked) {
            selected.push(check.value);
        }
    });

    let visible = 0;

    bikes.forEach(bike => {
        const name = bike.dataset.name.toLowerCase();
        const category = bike.dataset.cat;
        const price = Number(bike.dataset.price);
        const id = Number(bike.dataset.id);

        let show = true;

        if (selected.length > 0 && !selected.includes(category)) {
            show = false;
        }

        if (price > maxPrice) {
            show = false;
        }

        if (!name.includes(search)) {
            show = false;
        }

        if (favMode && !favorites.includes(id)) {
            show = false;
        }

        bike.classList.toggle("hide", !show);

        if (show) visible++;
    });

    document.querySelector("#total").textContent =
        visible + " bikes available";

    document.querySelector("#empty-products").classList.toggle(
        "show",
        visible === 0
    );
}

checks.forEach(check => {
    check.addEventListener("change", filterBikes);
});

document.querySelector("#search").addEventListener("input", filterBikes);

document.querySelector("#price").addEventListener("input", () => {
    const value = document.querySelector("#price").value;

    document.querySelector("#price-text").textContent = priceText(value);

    filterBikes();
});

document.querySelector("#apply").addEventListener("click", filterBikes);

document.querySelector("#reset").addEventListener("click", () => {
    checks.forEach(check => check.checked = false);

    document.querySelector("#search").value = "";
    document.querySelector("#price").value = 200000;
    document.querySelector("#price-text").textContent = "200,000 ₽";

    favMode = false;

    document.querySelector("#fav-open").classList.remove("selected");

    filterBikes();
});

/* SORT */

document.querySelector("#sort").addEventListener("change", () => {
    const value = document.querySelector("#sort").value;
    const box = document.querySelector("#cards");

    let list = [...bikes];

    if (value === "cheap") {
        list.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    }

    if (value === "expensive") {
        list.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    }

    list.forEach(bike => {
        box.appendChild(bike);
    });
});

/* CATEGORY BUTTONS */

document.querySelectorAll(".cat").forEach(category => {
    category.addEventListener("click", () => {
        const name = category.dataset.cat;

        checks.forEach(check => {
            check.checked = check.value === name;
        });

        favMode = false;
        document.querySelector("#fav-open").classList.remove("selected");

        filterBikes();
    });
});

/* MOBILE MENU */

document.querySelector("#menu-btn").addEventListener("click", () => {
    document.querySelector("#nav").classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelector("#nav").classList.remove("open");
    });
});

/* FAQ */

document.querySelectorAll(".question").forEach(button => {
    button.addEventListener("click", () => {
        const item = button.closest(".faq-item");

        item.classList.toggle("active");
    });
});

/* NEWSLETTER */

document.querySelector("#news-form").addEventListener("submit", event => {
    event.preventDefault();

    document.querySelector("#news-text").textContent =
        "Demo mode: newsletter is not connected yet.";

    document.querySelector("#email").value = "";
});

/* CHECKOUT */

document.querySelector("#checkout").addEventListener("click", () => {
    if (cart.length === 0) {
        toast("Your bag is empty");
    } else {
        toast("Checkout is not connected yet");
    }
});

/* BACK TO TOP */

window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
        document.querySelector("#top-btn").classList.add("show");
    } else {
        document.querySelector("#top-btn").classList.remove("show");
    }
});

document.querySelector("#top-btn").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* LOADING */

window.addEventListener("load", () => {
    setTimeout(() => {
        document.querySelector("#load").classList.add("hide");
    }, 600);
});

/* START */

drawCart();
drawFavorites();
filterBikes();