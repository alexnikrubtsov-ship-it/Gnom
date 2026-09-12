<script>
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

let profile = null;

async function loadProfile() {
    try {
        const response = await fetch("/api/profile", {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("profile error");
        }

        profile = await response.json();
        renderProfile();

    } catch (error) {
        console.error(error);
    }
}

function renderProfile() {
    if (!profile) return;

    const user = profile.user || {};

    document.getElementById("profileName").textContent =
        user.name || "Игрок";

    document.getElementById("profileUsername").textContent =
        user.username ? "@" + user.username : "Без username";

    document.getElementById("profileCoins").textContent =
        profile.coins ?? 0;

    document.getElementById("refCount").textContent =
        profile.referrals?.count ?? 0;

    document.getElementById("profileRank").textContent =
        profile.rank ?? "—";

    document.getElementById("profileSkin").textContent =
        profile.skin || "Обычный";

    document.getElementById("infoId").textContent =
        user.telegram_id ?? "—";

    document.getElementById("infoName").textContent =
        user.name || "—";

    document.getElementById("infoUsername").textContent =
        user.username ? "@" + user.username : "—";

    document.getElementById("infoDate").textContent =
        profile.created_at
            ? new Date(profile.created_at).toLocaleDateString("ru-RU")
            : "—";

    document.getElementById("infoRefs").textContent =
        profile.referrals?.count ?? 0;

    document.getElementById("infoRefCoins").textContent =
        (profile.referrals?.earned ?? 0) + " 🪙";

    document.getElementById("referralInput").value =
        profile.referral_link || "";

    document.getElementById("editName").value =
        user.name || "";

    document.getElementById("editBio").value =
        user.bio || "";

    if (user.photo_url) {
        document.getElementById("profileAvatar").innerHTML =
            `<img src="${escapeHtml(user.photo_url)}">`;
    }

    renderReferrals();
}

function renderReferrals() {
    const container =
        document.getElementById("referralsContainer");

    const referrals = profile?.referrals?.users || [];

    if (!referrals.length) {
        container.innerHTML =
            `<div class="empty-referrals">
                Пока никто не приглашён
             </div>`;
        return;
    }

    container.innerHTML = referrals.map(user => `
        <div class="info-row">
            <span>👤 ${escapeHtml(user.name || "Игрок")}</span>
            <b>+150 🪙</b>
        </div>
    `).join("");
}

async function copyReferral() {
    const input = document.getElementById("referralInput");

    if (!input.value) return;

    await navigator.clipboard.writeText(input.value);

    if (tg?.showPopup) {
        tg.showPopup({
            title: "Готово",
            message: "Реферальная ссылка скопирована!",
            buttons: [{type: "ok"}]
        });
    }
}

function shareReferral() {
    const link = document.getElementById("referralInput").value;

    if (!link) return;

    const text =
        "Заходи в нашего гнома 🌲🧙";

    const shareUrl =
        "https://t.me/share/url?url=" +
        encodeURIComponent(link) +
        "&text=" +
        encodeURIComponent(text);

    if (tg?.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
    } else {
        window.open(shareUrl, "_blank");
    }
}

function openEditProfile() {
    document
        .getElementById("editProfileModal")
        .classList.remove("hidden");
}

function closeEditProfile() {
    document
        .getElementById("editProfileModal")
        .classList.add("hidden");
}

async function saveProfile() {
    const name =
        document.getElementById("editName").value.trim();

    const bio =
        document.getElementById("editBio").value.trim();

    if (!name) return;

    try {
        const response = await fetch("/api/profile/update", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                bio
            })
        });

        if (!response.ok) {
            throw new Error("update error");
        }

        closeEditProfile();
        await loadProfile();

    } catch (error) {
        alert("Не удалось сохранить профиль");
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadProfile();
</script>
