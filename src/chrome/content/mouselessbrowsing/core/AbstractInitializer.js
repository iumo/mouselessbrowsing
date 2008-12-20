with(mlb_common){
with(mouselessbrowsing){
(function(){
   function AbstractInitializer(pageInitData){
      this.pageInitData = pageInitData
      this.spanPrototype = null
   }
   
   //Static methods
      /*
    * Set special/orignal styles according visibility of id span
    * @param element: Formelement for which the style should be set/reset
    * @param idSpanVisible: Flag indicating if the corresponding idSpan is visible
    */
   AbstractInitializer.setElementStyle = function(element, idSpanVisible){
      var styleArray = null
      if(idSpanVisible==false && element.elemStylesIdOff!=null){
         styleArray = element.elemStylesIdOff
      } else if (idSpanVisible==true && element.elemStylesIdOn!=null){
         styleArray = element.elemStylesIdOn
      }
      if(styleArray==null){
         return
      }
      for(var i=0; i<styleArray.length; i++ ){
         var styleEntry = styleArray[i]
         element.style[styleEntry.style] = styleEntry.value
      }
   },

   AbstractInitializer.prototype = {
      constructor: AbstractInitializer,
      AbstractInitializer: AbstractInitializer,
      
      /*
       * Creates new IdSpan
       */
      createSpan: function(){
          if(this.spanPrototype==null){
              //span
              var span = this.pageInitData.getCurrentDoc().createElement("span");
              span.style.cssText = MlbPrefs.styleForIdSpan
              span.style.display = "inline";
              
              //Mark this span as id-span
              span.setAttribute(MlbCommon.ATTR_ID_SPAN_FLAG, "true");
              this.spanPrototype = span;
          }
          return this.pageInitData.getCurrentDoc().importNode(this.spanPrototype, true);
      },
      
      doOverlayPositioning: function(element, newSpan, parentElement, spanPosition){
         parentElement = parentElement?parentElement:element

         //Set link position relative but only if neither the link nor one of its descendants are positioned
         //as this would lead to disarrangements
         //See also MLB issue 25, 37,
         if(!this.isPositionedElement(parentElement)){
            parentElement.style.position="relative"
         }

         //Insert Link with absolute Positioning
         newSpan.style.position="absolute"
         newSpan.style.left="0px"
         newSpan.style.top="0px"
         if(parentElement==element)
            element.appendChild(newSpan)
         else
            DomUtils.insertAfter(newSpan, element)
         
         
         //If overlayed element is to small relative to the span do not 
         //TODO make configurable
         var factor = 2
         if(element.offsetWidth<factor*newSpan.offsetWidth && 
             element.offsetHeight<factor*newSpan.offsetHeight){
            spanPosition = SpanPosition.NORTH_EAST_OUTSIDE
         }         
         
         if(spanPosition==SpanPosition.NORTH_EAST_OUTSIDE){
            //Display in the right upper corner next to the element, as overlay is for e.g. for embedded objects not possible
            var currentMarginRight = this.getComputedStyle(element).marginRight
            currentMarginRight = StringUtils.isEmpty(currentMarginRight)?parseInt(currentMarginRight):0
            element.style.marginRight = (newSpan.offsetWidth-currentMarginRight) + "px" 
         }

         this.positionIdSpan(newSpan, element, spanPosition)
         
         newSpan.style.setProperty("background-color", "#EEF3F9", "important")
         newSpan.style.setProperty("color", "black", "important")
         return newSpan
      },
 
      getComputedStyle: function(element){
         return element.ownerDocument.defaultView.getComputedStyle(element, null)
      },
      
      /*
       *  Gets new span for id; 
       */
      getNewSpan: function(typeOfSpan){
          var newSpan = this.createSpan();
          this.setNewSpanId(newSpan)
          //Setting the type the element the id span is created for
          newSpan.setAttribute(MlbCommon.ATTR_ID_SPAN_FOR, typeOfSpan);
          return newSpan;
      },

      findParentOfLastTextNode: function(element){
         var childNodes = element.childNodes
         for (var i = childNodes.length-1; i >= 0; i--) {
            var child = childNodes.item(i)
            if(child.nodeType==Node.TEXT_NODE && !XMLUtils.isEmptyTextNode(child)){
               return element
            }else if (child.hasChildNodes() && this.isElementVisible(child)){
               var result = this.findParentOfLastTextNode(child)
               if(result!=null){
                  return result
               }
            }
         }
         return null;
      },
      
      hasVisibleText: function(elem, useComputedStyle, isRootElement){
         //visibility check not for element itself, as it could be initially hidden
         if(elem.textContent=="" ||
            (!isRootElement && useComputedStyle && !this.isElementVisible(elem)) ||
            (!isRootElement && !useComputedStyle && (elem.style.display=="none" || elem.style.visibility=="hidden" )))
            return false
         var children = elem.childNodes
         for (var i = 0; i < children.length; i++) {
            var child = children[i]
            if(child.nodeType==3 && !XMLUtils.isEmptyTextNode(child))
               return true
            else if (child.nodeType==1){
               var hasText = this.hasVisibleText(child, useComputedStyle, false)
               if(hasText)
                  return true
            }
               
         }
         return false
      },
      
      initIds: function(){
         if(MlbPrefs.debugPerf){
            var timer = new PerfTimer()
         }
         this._initIds()
         if(MlbPrefs.debugPerf){
            var type = ObjectUtils.getType(this)
            MlbUtils.logDebugMessage("Init time for " + type + ": " + timer.stop())
         }
      },
      
      insertSpanForTextElement: function(element, newSpan){
         //Append to last element in link except for imgages for better style
         var parentOfLastTextNode = this.findParentOfLastTextNode(element)
         if(parentOfLastTextNode!=null){
            parentOfLastTextNode.appendChild(newSpan)
         }else{
            element.appendChild(newSpan);
         }
         return newSpan
      },
      
      /*
       * Checks wether an element is currently visible to avoid appending ids to invisible links
       */
      isElementVisible: function(element){
         //Comment out 08.10.2008 due to mail from Martijn
         /*if(element.className=="" && element.getAttribute('style')==null){
            return true
         }*/
         if(!DomUtils.isVisible(element) ||
            //heuristic values
            element.offsetLeft<-100 || element.offsetTop<-100){
            return false
         }
         return true
      },
      
      isImageElement: function(element){
         if(element.hasAttribute("mlb_image_elem"))
            return true
            //TODO remove
//         var isImage = false
//         if(element.getElementsByTagName('img').length>0 ||
//            StringUtils.isEmpty(element.textContent) || StringUtils.trim(element.textContent).length==0){
//            isImage = true
//         }
//         //Check if any visible text is there
//         if(!isImage)
         isImage = !this.isTextElement(element)
         if(isImage)
            element.setAttribute("mlb_image_elem", "true")
         return isImage 
      },

      //TODO all descendants must be searched for positioned elements
      isPositionedElement: function(element){
         var style = this.getComputedStyle(element)
         if(style.position!="static")
            return true
         if(element.hasChildNodes()){
            for (var i = 0; i < element.childNodes.length; i++) {
               var node = element.childNodes[i]
               if(node.nodeType==1 && this.isPositionedElement(node)){
                  return true
               }
            }
         }
         return false
      },
      
      isTextElement: function(element){
         var useComputedStyle = true
         if(!DomUtils.isVisible)
            useComputedStyle = false
         return this.hasVisibleText(element, true, true)
      },
      
      positionIdSpan: function(idSpan, element, spanPosition){
         idSpan.style.position="relative"
         idSpan.style.marginRight = (-idSpan.offsetWidth) + "px"
         idSpan.style.marginBottom = (-idSpan.offsetHeight) + "px"
         
         if(spanPosition==SpanPosition.EAST_OUTSIDE || 
            spanPosition==SpanPosition.NORTH_EAST_OUTSIDE){
            var currentMarginRight = this.getComputedStyle(element).marginRight
            currentMarginRight = StringUtils.isEmpty(currentMarginRight)?parseInt(currentMarginRight):0
            element.style.marginRight = (idSpan.offsetWidth-currentMarginRight) + "px"
         }
         
         var spanOffset = DomUtils.getOffsetToBody(idSpan)
         var elementOffset = DomUtils.getOffsetToBody(element)
         
         var left = elementOffset.x - spanOffset.x 
         if(spanPosition==SpanPosition.EAST_OUTSIDE || 
            spanPosition==SpanPosition.NORTH_EAST_OUTSIDE){
            left = left + element.offsetWidth
         }else if(spanPosition==SpanPosition.NORTH_EAST_INSIDE){
            left = left + element.offsetWidth - idSpan.offsetWidth
         }else {
            throw new Error('unkown span position')
         }
         var top = elementOffset.y - spanOffset.y 
         if(spanPosition == SpanPosition.EAST_OUTSIDE){
            top = top + (element.offsetHeight - idSpan.offsetHeight)/2
         }
         //Take already set value into acount
         if(left!=0){
            left += idSpan.style.left?parseInt(idSpan.style.left, 10):0
            idSpan.style.left = left + "px"
         }
         if(top!=0){
            top += idSpan.style.top?parseInt(idSpan.style.top, 10):0
            idSpan.style.top = top + "px"
         }
         
         //Adjust margin-bottom if span was inserted below elmenet
         var isLineBreakBetween = elementOffset.y + elementOffset.offsetHeight < spanOffset.y
         if(isLineBreakBetween){
            
         }
      },
      
      setNewSpanId: function(span){
         span.mlb_initCounter = this.pageInitData.getInitCounter()
         var newId = this.pageInitData.pageData.getNextId();
         span.textContent = newId
      },

      /*
       * Updates an id span which already exists
       */
      updateSpan: function(span){
          this.setNewSpanId(span) 
          span.style.display = "inline";
      }
     
   }
   
   Namespace.bindToNamespace("mouselessbrowsing", "AbstractInitializer", AbstractInitializer)

   SpanPosition = {
      APPEND_TEXT: "APPEND_TEXT", 
      EAST_OUTSIDE: "EAST_OUTSIDE",
      NORTH_EAST_INSIDE: "NORTH_EAST_INSIDE",
      NORTH_EAST_OUTSIDE: "NORTH_EAST_OUTSIDE"
   }      
   Namespace.bindToNamespace("mouselessbrowsing", "SpanPosition", SpanPosition)
})()
}}