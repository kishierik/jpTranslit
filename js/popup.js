
/**
 * Popupを作ります
 * @returns {object}    Divのオブジェクト
 */
createPopup = function() {
    var div = document.createElement("div");

    div.style.position = "absolute";
    div.style.left = window.getSelection().getRangeAt(0).getBoundingClientRect().left + 50 + "px";
    div.style.top = window.scrollY + window.getSelection().getRangeAt(0).getBoundingClientRect().top + "px";
    div.style.border = "2px solid black";
    div.style.backgroundColor = "white";
    div.style.padding = "15px";
    div.style.maxWidth = "500px";
    div.style.zIndex = 200;
    return div;
}

/**
 *　ふりがなを表示されるテキストを作ります
 * @param   {string}    content   表示されるテキスト
 * @returns {object}    Textのオブジェクト
 */
createText = function(content) {
    var text = document.createElement("span");

    text.style.fontSize = "14px";
    text.innerHTML = content.replace(/<a/g, "<a style='color: black; cursor: pointer' target='_blank'");
    return text;
}

/**
 *　ボタンを作ります
 * @param   {string}    id      ボタンのID
 * @param   {string}    text    表示されるテキスト
 * @returns {object}    Textのオブジェクト
 */
createButton = function(id, text) {
    var button = document.createElement("button");

    button.id = id;
    button.style.display = "block";
    button.style.marginTop = "10px";
    button.textContent = text;
    return button;
}

/**
 * Popup全体を表示します
 * @param   {string}    selection    表示されるテキスト
 */
displayBox = function(selection) {
    var popup = createPopup();
    var content = createText(selection);
    var closeButton = createButton("close_button", "Close");

    document.body.appendChild(popup);
    popup.appendChild(content);
    popup.appendChild(closeButton);

    closeButton.onclick = function() {
        popup.remove();
    }
}

displayBox(selection);