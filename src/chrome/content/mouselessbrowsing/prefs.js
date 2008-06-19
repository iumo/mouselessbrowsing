/* 

  Mouseless Browsing 
  Version 0.4.3
  Created by Rudolf No�
  30.12.2007
  
  Borrowed from pref-tabprefs.js (c) Bradley Chapman (THANKS!)
*/

/***** Preference Dialog Functions *****/
var gPref = Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefBranch);

function doOnload(){
        var checkboxes = document.getElementsByTagName("checkbox");
        for (var i = 0; i < checkboxes.length; i++)
        {
            var checkbox = checkboxes[i];
            if(!gPref.prefHasUserValue(checkbox.getAttribute("prefid"))){
                gPref.setBoolPref(checkbox.getAttribute("prefid"), checkbox.getAttribute("defaultValue"));
            }
            checkbox.checked = gPref.getBoolPref(checkbox.getAttribute("prefid"));
        }
        var textfields = document.getElementsByTagName("textbox");
        for (i = 0; i < textfields.length; i++)
        {
            var textfield = textfields.item(i);
            if(!gPref.prefHasUserValue(textfield.getAttribute("prefid"))){
                gPref.setCharPref(textfield.getAttribute("prefid"), textfield.getAttribute("defaultValue"));
            }
            textfield.value = gPref.getCharPref(textfield.getAttribute("prefid"));
        }
        var keyinputboxes = document.getElementsByTagName("keyinputbox");
        for (i = 0; i < keyinputboxes.length; i++)
        {
            var keyinputbox = keyinputboxes.item(i);
            if(!gPref.prefHasUserValue(keyinputbox.getAttribute("prefid"))){
                gPref.setCharPref(keyinputbox.getAttribute("prefid"), keyinputbox.getAttribute("defaultValue"));
            }
            keyinputbox.combinedValue = gPref.getCharPref(keyinputbox.getAttribute("prefid"));
        }
        var selectboxes = document.getElementsByTagName("select");
        for (i = 0; i < selectboxes.length; i++)
        {
            var selectbox = selectboxes[i];
            if(!gPref.prefHasUserValue(selectbox.getAttribute("prefid"))){
                gPref.setCharPref(selectbox.getAttribute("prefid"), selectbox.getAttribute("defaultValue"));
            }
            selectbox.value = gPref.getCharPref(selectbox.getAttribute("prefid"));
            var options = selectbox.children;
            for(var j=0; j<options.length; i++){
                if(options[j].value==selectbox.value){
                    options[i].selected=true;
                }
            }
        }

}

function saveUserPrefs(){
    var checkboxes = document.getElementsByTagName("checkbox");
    try{
        for (var i = 0; i < checkboxes.length; i++)
        {
            var checkbox = checkboxes[i];
            gPref.setBoolPref(checkbox.getAttribute("prefid"), checkbox.checked);
        }
        var textfields = document.getElementsByTagName("textbox");
        for (i = 0; i < textfields.length; i++)
        {
            var textfield = textfields[i];
            gPref.setCharPref(textfield.getAttribute("prefid"), textfield.value);
        }
        var keyinputboxes = document.getElementsByTagName("keyinputbox");
        for (i = 0; i < keyinputboxes.length; i++)
        {
            var keyinputbox = keyinputboxes[i];
            gPref.setCharPref(keyinputbox.getAttribute("prefid"), keyinputbox.combinedValue);
        }
        var selectboxes = document.getElementsByTagName("select");
        for (i = 0; i < selectboxes.length; i++)
        {
            var selectbox = selectboxes[i];
            gPref.setCharPref(selectbox.getAttribute("prefid"), selectbox.value);
        }

    }catch(e){
        alert(e);
    }
    //ReInit ShortCuts in Main Window
    /*try{
        if(opener && opener.MLB_initShortCuts){
            opener.MLB_initShortCuts();
        }else if (opener && opener.opener && opener.opener.MLB_initShortCuts){
            opener.opener.MLB_initShortCuts();
        }
    }catch(e){}*/
    //Notify Pref-observer
    var observerService = Components.classes["@mozilla.org/observer-service;1"].
        getService(Components.interfaces.nsIObserverService);
    observerService.notifyObservers ( null , "MBL-PrefChange" , null);

}

function dialogHelp(){
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
	var win = wm.getMostRecentWindow("navigator:browser");
	var browser = win.getBrowser()
	browser.selectedTab = browser.addTab("http://mlb.rudolf-noe.de")
	window.opener.focus()		
}

function onClickSmartPos(event){
    if(event.originalTarget.checked){
        //Status is before click!!
        //--> disable elements
        document.getElementById("smartPosMinHeight").disabled=true;
        document.getElementById("smartPosMinWidth").disabled=true;
        document.getElementById("styleForImageIdSpan").disabled=true;
    }else{
        document.getElementById("smartPosMinHeight").disabled=false;
        document.getElementById("smartPosMinWidth").disabled=false;
        document.getElementById("styleForImageIdSpan").disabled=false;
    }
}

