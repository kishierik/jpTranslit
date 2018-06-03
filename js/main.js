/**
 * ふりがな機能用設定
 * @prop {string}   appId               Yahoo App ID
 * @prop {string}   requestUrl          YahooリクエストURL
 * @prop {string}   searchFurigana      Responseから検索するXML Tag
 * @prop {string}   searchSubWordList   Responseから複数結果がある場合のXML Tag
 */

var yahooSettings = {
    appId:              "",
    requestUrl:         "https://jlp.yahooapis.jp/FuriganaService/V1/furigana?appid=",
    searchFurigana:     "Furigana",
    searchSubWordList:  "SubWordList"
};

/**
 * 説明用設定
 * @prop {string}   kotobankRequestUrl      KotobankリクエストURL
 * @prop {string}   weblioRequestUrl        WeblioリクエストURL
 * @prop {string}   kotobankClass           DOMに検索するクラス
 * @prop {string}   weblioClass             DOMに検索するクラス
 * @prop {string}   googleRequestUrl        Google TranslateのリクエストURL
 */

var descriptionSettings = {
    kotobankRequestUrl: "https://kotobank.jp/word/",
    weblioRequestUrl:   "http://www.weblio.jp/content/",
    kotobankClass:      "description",
    weblioClass:        "kiji",
    googleRequestUrl:   "https://translate.google.co.jp/#ja/en/"
};

/**
 * Yahoo API経由でふりがなを取得する関数
 * @param   {string}    selection   Chromeで取得したHighlighted Selection
 * @returns {string}    Yahooで取得したふりがなを返します
 */

getFurigana = function(selection) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var furiganaResult      = httpRequest.responseXML.getElementsByTagName(yahooSettings.searchFurigana);
            var subWordListResult   = httpRequest.responseXML.getElementsByTagName(yahooSettings.searchSubWordList);
            var furiganaSentence    = "";
            for (var i = 0; i < furiganaResult.length ; i++) {
                if (subWordListResult.length > 0 && i === 0) {
                    i = 1;
                }
                furiganaSentence += furiganaResult[i].textContent;
            }
            executeGoogleChromeScript(furiganaSentence);
        }
    };
    var httpRequestUrl = yahooSettings.requestUrl + yahooSettings.appId + "&sentence=" + selection;
    httpRequest.open("GET", httpRequestUrl, true);
    httpRequest.send();
}

/**
 * getFuriganaを呼ぶ関数
 * @param   {object}    selection   GoogleChromeで取得したHighlighted Text
 */
callGetFurigana = function(selection) {
    getFurigana(selection.selectionText);
}

/**
 * 言葉の説明を取得する
 * @param   {string}    selection       Chromeで取得したHighlighted Selection
 * @param   {string}    requestTarget   リクエストするウェブサイト
 */

getDescription = function(selection, requestTarget) {
    switch(requestTarget) {
        case descriptionSettings.weblioClass:
            var requestUrl      = descriptionSettings.weblioRequestUrl;
            var requestClass    = descriptionSettings.weblioClass;
            break;
        case descriptionSettings.kotobankClass:
            var requestUrl      = descriptionSettings.kotobankRequestUrl;
            var requestClass    = descriptionSettings.kotobankClass;
            break;
    }
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var dom = new DOMParser();
            var responseHTML = dom.parseFromString(httpRequest.response, "text/html");
            var allDescriptions = responseHTML.getElementsByClassName(requestClass);
            var selectedDescription = allDescriptions[0].innerHTML;
            if (allDescriptions.length > 1 && requestClass === descriptionSettings.kotobankClass) {
                selectedDescription = allDescriptions[1].innerHTML;
            }
            executeGoogleChromeScript(selectedDescription);
        }
    };
    var httpRequestUrl = requestUrl + selection;
    httpRequest.open("GET", httpRequestUrl, true);
    httpRequest.send();
}

/**
 * getDescriptionを呼ぶ関数
 * @param   {object}    selection   GoogleChromeで取得したHighlighted Text
 */
callGetDescription = function(selection) {
    getDescription(selection.selectionText, descriptionSettings.weblioClass);
}

/**
 * ChromeのExecuteScriptを呼び出す関数
 * @param   {object}    data    送信するデータ
 */
executeGoogleChromeScript = function(data) {
    chrome.tabs.executeScript({
        code: 'var selection = ' + JSON.stringify(data)
    }, function() {
        chrome.tabs.executeScript({file: 'js/popup.js'});
    });
}

/**
 * 選択したテキストでGoogle Translateを新タブで開く
 * @param   {object}    selection   GoogleChromeで取得したHighlighted Text
 */
openGoogleTranslate = function(selection) {
    var url = descriptionSettings.googleRequestUrl + selection.selectionText;
    window.open(url, "_blank");
}

/**
 * 選択したテキストを取得して関数を呼び出す (Furigana)
 */
chrome.contextMenus.create({
    title:      "ふりがなを見る",
    contexts:   ["selection"],
    onclick:    callGetFurigana
});

/**
 * 選択したテキストを取得して関数を呼び出す (Description)
 */
chrome.contextMenus.create({
    title:      "意味を見る",
    contexts:   ["selection"],
    onclick:    callGetDescription
});

/**
 * 新しいタブでGoogle Translateを開くというコンテキストメニューの追加
 */
chrome.contextMenus.create({
    title:      "Google Translateで開く",
    contexts:   ["selection"],
    onclick:    openGoogleTranslate
});