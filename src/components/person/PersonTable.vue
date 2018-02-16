<!--
        Copyright 2018 IBM Corp All Rights Reserved

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 -->
<template>
  <div>
    <table class="table">
      <caption v-if="caption" class="table-header">
        <span class="u-text--bold">Stock Portfolio</span>
      </caption>
      <thead v-if="headings" class="table__head">
      <tr class="table__row">
        <th v-for="heading in headings" class="table__cell" scope="col" :key="heading.id" :is="Array"
            v-on:click="sortColumn (columnIndex)">
          <span v-if="heading.label && !heading.hideLabel" v-text="heading.label"></span>
          <hc-icon v-if="heading.sortable" class="icon"
                   :class="{ 'icon--down': !heading.sortedReverse, 'icon--up': heading.sortedReverse }"
                   :href="heading.sortedReverse ? 'hc (arrow-up)' : 'hc (arrow-down)'"></hc-icon>
        </th>
      </tr>
      </thead>
      <tfoot>
        <tr>
          <div class="row"><br/></div>
          <div class="row u-float--right box--vertical-center">
            <div class="box box--full">
              <hc-button class="js-modal" data-modal-target="Sell" hc-style="secondary">Sell Stock</hc-button>
              <hc-button class="js-modal" data-modal-target="Buy" hc-style="primary">Buy Stock</hc-button>
            </div>
          </div>
        </tr>
      </tfoot>
      <tbody class="table__body">
      <stocks v-bind:portfolioData=data></stocks>
      </tbody>
    </table>
    <action-modal action="buy" :portfolio="data" hcName="Buy" :hcTitle="'Buy stocks for '+ data.owner"></action-modal>
    <action-modal action="sell" :portfolio="data" hcName="Sell" :hcTitle="'Sell stocks for '+ data.owner"></action-modal>
  </div>
</template>

<script>
  import hcIcon from '@hybrid-cloud/cirrus-vue/src/components/hc-icon/hc-icon'
  import hcButton from '@hybrid-cloud/cirrus-vue/src/components/hc-button/hc-button'
  import stocks from './Stocks'
  import actionModal from '../portfolio/ActionModal'

  export default {
    name: 'personTable',
    components: {
      'hc-icon': hcIcon,
      'hc-button': hcButton,
      'stocks': stocks,
      'action-modal': actionModal
    },
    methods: {
      sortColumn (columnIndex) {
        console.log(columnIndex)
        this.$emit('sortColumn', columnIndex)
      }
    },
    updated () {
      // import('../../../node_modules/@hybrid-cloud/cirrus/dist/js/cirrus.es5.js')
    },
    props: {
      caption: String,
      headings: Array,
      data: Object
    },
    data () {
      return {
        user: null
      }
    }
  }
</script>
<style lang="scss">
  @import "~@hybrid-cloud/cirrus-vue/src/globals/scss/cirrus-globals";
  @import "~@hybrid-cloud/cirrus/src/scss/elements/tables/tables";
</style>
