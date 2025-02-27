function showEndScreen(didWin) {
    document.getElementById("win-message").classList.add("hidden");
    document.getElementById("lose-message").classList.add("hidden");

    if (didWin) {
        document.getElementById("win-message").classList.remove("hidden");
    } else {
        document.getElementById("lose-message").classList.remove("hidden");
    }
}
