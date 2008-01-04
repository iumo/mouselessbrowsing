/*
 * Util-Functions of MLB
 * Rudolf No�
 * 31.12.2007 
 */
(function(){
	
	//Imports
	var MlbCommon = mouselessbrowsing.MlbCommon
	var XMLUtils = rno_common.XMLUtils 
	
	var MlbUtils = {
		/*
		 * Determines wether the provided span-node is an Id-Span
		 * @param DOM-Element
		 * @returns boolean
		 */
		isIdSpan: function(element){
         return element.getAttribute && element.getAttribute(MlbCommon.ATTR_ID_SPAN_FLAG)!=null;
      },
      
      getElementForIdSpan: function(idSpan){
         return idSpan[MlbCommon.ATTR_ELEMENT_FOR_ID_SPAN]	
      },
      
      setElementForIdSpan: function(idSpan, element){
      	idSpan[MlbCommon.ATTR_ELEMENT_FOR_ID_SPAN]=element
      },
      
		/*
		* Returns true when the srcElement of the keyevent is an textfield, password-field
		* selectbox or textarea
		*/
		isWritableElement: function(element){
		   if(element==null || element.tagName==null)
		       return false;
		   var tagName = element.tagName.toUpperCase();
		   var type = element.type?element.type.toUpperCase():"";
		   var isWritableFormElement = (tagName.indexOf("INPUT")!=-1 && (type=="TEXT" || 
		           type=="PASSWORD")) || tagName.indexOf("TEXTAREA")!=-1 || 
		           tagName.indexOf("SELECT")!=-1;
		   return isWritableFormElement;
		},
		
		ElementTypes: {
			TEXT: "TEXT",
			PASSWORD: "PASSWORD",
			TEXTAREA: "TEXTAREA",
			SELECT: "SELECT",
			CHECKBOX: "CHECKBOX",
			RADIO: "RADIO",
			BUTTON: "BUTTON"
		},
		
		isElementOfType: function(element, type){
			if(this.ElementTypes.TEXT==type){
				return XMLUtils.isTagName(element, "INPUT") && "text"==element.type
			}else if (this.ElementTypes.PASSWORD==type){
            return XMLUtils.isTagName(element, "INPUT") && "password"==element.type
			}else if(this.ElementTypes.TEXTAREA==type){
            return XMLUtils.isTagName(element, "TEXTAREA")
         }else if(this.ElementTypes.SELECT==type){
            return XMLUtils.isTagName(element, "SELECT")
         }else if(this.ElementTypes.BUTTON==type){
            return XMLUtils.isTagName(element, "BUTTON") || 
                     (XMLUtils.isTagName(element, "INPUT") && "button"==element.type) ||
                     (XMLUtils.isTagName(element, "INPUT") && "submit"==element.type) ||
                     (XMLUtils.isTagName(element, "INPUT") && "reset"==element.type)  ||
                     (XMLUtils.isTagName(element, "INPUT") && "image"==element.type)  ||
                     (XMLUtils.isTagName(element, "INPUT") && "file"==element.type)
         }else if(this.ElementTypes.CHECKBOX==type){
            return XMLUtils.isTagName(element, "INPUT") && "checkbox"==element.type
         }else if(this.ElementTypes.RADIO==type){
            return XMLUtils.isTagName(element, "INPUT") && "radio"==element.type
         }
		},
		
		getOffsetLeftToBody: function(element){
			var offsetLeft = element.offsetLeft
			while(element.offsetParent!=null){
				element = element.offsetParent
				offsetLeft += element.offsetLeft
			}
			return offsetLeft
		},

      getOffsetTopToBody: function(element){
         var offsetTop = element.offsetTop
         while(element.offsetParent!=null){
            element = element.offsetParent
            offsetTop += element.offsetTop
         }
         return offsetTop
      }
      
	}
	var NS = rno_common.Namespace
	NS.bindToNamespace("mouselessbrowsing", "MlbUtils", MlbUtils)
})()