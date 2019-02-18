<template>
  <div class="tooltip">
    <img ref="tooltipImage" class="pointer-image" :src="source" />
    <span ref="tooltipText" class="tooltiptext" v-bind:class="positionClass"><div>{{ text }}</div></span>
  </div>
</template>

<style>
.pointer-image {
  max-width: 100%;
  cursor: pointer;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  width: 320px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 5px;
  position: absolute;
  z-index: 1;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltiptext div {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip .tooltiptext::after {
  content: ""; 
  position: absolute;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
}

.tooltip .tooltip-top.tooltiptext {
  top: -35px;
  left: calc(50% - 160px);  
}

.tooltip .tooltip-top.tooltiptext::after {
  top: 30px;
  left: 50%;
  border-color: #555 transparent transparent transparent;  
}

.tooltip .tooltip-bottom.tooltiptext {
  bottom: -28px;
  left: calc(50% - 160px);  
}

.tooltip .tooltip-bottom.tooltiptext::after {
  bottom: 30px;
  left: 50%;
  border-color:  transparent transparent #555 transparent;  
}

.tooltip .tooltip-left.tooltiptext {
  left: -325px;
  top: calc(50% - 16px);  
}

.tooltip .tooltip-left.tooltiptext::after {
  top: 12px;
  right: -10px;
  border-color:  transparent transparent transparent #555;  
}

.tooltip .tooltip-right.tooltiptext {
  right: -325px;
  top: calc(50% - 16px);  
}

.tooltip .tooltip-right.tooltiptext::after {
  top: 12px;
  right: 100%;
  border-color:  transparent #555 transparent transparent;  
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>

<script>
export default {
  props: ['source', 'text', 'position'],
  computed: {
    positionClass () {
      return posDictionary[this.position]
    }
  }
}

const posDictionary = {
  'Left': 'tooltip-left',
  'Right': 'tooltip-right',
  'Top': 'tooltip-top',
  'Bottom': 'tooltip-bottom'
}
</script>
