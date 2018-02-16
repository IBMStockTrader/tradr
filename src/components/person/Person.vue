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
    <stock-header></stock-header>
    <div class="container">
      <div class="row u-push-top--large">
        <div class="box box--full">
        <hc-page-header
          hc-breadcrumb-text="Previous"
          :hc-title="this.user"></hc-page-header>
        </div>
      </div>
      <div class="row u-push-top--large">
        <div class="box box--full">
          <hc-card>
            <hc-card-title class="headerDivider cardHeader" hc-rank="1" hc-style-level="5">
              Client Overview
            </hc-card-title>
            <hc-card-body>
              <person-info :portfolioValue="this.data.total" :rateOfReturn="this.rateOfReturn"></person-info>
              <br/>
              <personTable :caption="caption" :headings="headings" :data="data" v-on:sortColumn="sortColumn"></personTable>
            </hc-card-body>
          </hc-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>2
  import hcPageHeader from '@hybrid-cloud/cirrus-vue/src/components/hc-page-header/hc-page-header'
  import hcCards from '@hybrid-cloud/cirrus-vue/src/components/hc-card/index.js'
  // Build on top of cirrus-vue
  import personTable from './PersonTable'
  import stockHeader from '../Header'
  import personInfo from './PersonInfo'

  // Import msg bus
  import bus from '../bus'

  // REST project
  import axios from 'axios'

  // Get cirrus lib

  export default {
    name: 'person',
    components:
      Object.assign({
        'hc-page-header': hcPageHeader,
        'stockHeader': stockHeader,
        'personTable': personTable,
        'personInfo': personInfo
      }, hcCards.components),
    updated () {
      // import('../../../node_modules/@hybrid-cloud/cirrus/dist/js/cirrus.es5.js')
    },
    created () {
      bus.$on('updatedPortfolio', this.updateTable)
    },
    mounted () {
      this.user = this.$route.params.user
      console.log(this.user)
      this.getPortfolio(this.user)
      this.rateOfReturn = this.generateRandomRateOfReturn(-5, 5, 3)
    },
    methods: {
      format (number) {
        var formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
          // the default value for minimumFractionDigits depends on the currency
          // and is usually already 2
        })
        console.log('number ' + number)
        console.log('new number ' + formatter.format(number))
        return formatter.format(number)
      },
      generateRandomRateOfReturn (minimum, maximum, precision) {
        minimum = minimum === undefined ? 0 : minimum
        maximum = maximum === undefined ? 9007199254740992 : maximum
        precision = precision === undefined ? 0 : precision
        var random = Math.random() * (maximum - minimum) + minimum
        return random.toFixed(precision)
      },
      getPortfolio (user) {
        console.log('user is ' + user)
        axios.get('/portfolio/' + user, {headers: {'Authorization': 'Bearer '+this.$jwt.getToken()}})
          .then(response => {
            console.log('here comes the response from viewPortfolio')
            var person = response.data
            console.log(person)
            // Format total cost
            person.total = this.format(person.total)
            for (var i in person.stocks) {
              person.stocks[i].price = this.format(person.stocks[i].price)
              person.stocks[i].total = this.format(person.stocks[i].total)
            }
            console.log(person)
            this.data = person
            bus.$emit('triggerCirrus')
          })
          .catch(e => {
            this.errors.push(e)
          })
      },
      updateTable (profileData) {
        console.log('got an updated set of stock data')
        console.log(profileData)
        console.log(this.owner)
        console.log(this.data)
        if (profileData.constructor !== Array) {
          console.log('got an object')
          for (var i in profileData.stocks) {
            profileData.stocks[i].price = this.format(profileData.stocks[i].price)
            profileData.stocks[i].total = this.format(profileData.stocks[i].total)
          }
          this.data = profileData
        } else {
          console.log('getting portfolio data for user ' + this.user)
          this.getPortfolio(this.user)
        }
      },
      sortColumn (colIndex) {
        // TODO Broken
        // NOTE: A sample sort, not a sensible one. Columns like status and date will likely need specific sorts

        let sortFn

        console.log(colIndex)
        console.log(this.headings[colIndex].sortedReverse)
        if (this.headings[colIndex].sortedReverse) {
          this.headings[colIndex].sortedReverse = false
          sortFn = (a, b) => {
            console.log('sort normal')
            console.log(b)
            console.log(a)
            console.log(a[this.headings[colIndex].field])
            console.log(b[this.headings[colIndex].field])
            a[this.headings[colIndex].field].localeCompare(b[this.headings[colIndex].field])
          }
        } else {
          // may not exist, use this.$set
          this.$set(this.headings[colIndex], 'sortedReverse', true)
          console.log('sort reverse')
          sortFn = (a, b) => {
            console.log(b)
            console.log(a)
            console.log(a[this.headings[colIndex].field])
            console.log(b[this.headings[colIndex].field])
            b[this.headings[colIndex].field].localeCompare(a[this.headings[colIndex].field])
            var options = {
              options: {
                ignorePunctuation: true
              }
            }
            console.log(b[this.headings[colIndex].field].localeCompare(a[this.headings[colIndex].field], options))
          }
          this.data.sort(sortFn)
        }
      }
    },
    data () {
      return {
        errors: [],
        caption: `<span class="u-text--bold">Clients</span>`,
        headings: [
          {
            label: 'Stock Symbol',
            hideLabel: false,
            sortable: true,
            field: 'owner'
          }, {
            label: 'Shares',
            sortable: true,
            field: 'total'
          }, {
            label: 'Price',
            sortable: true,
            sortedReverse: true,
            field: 'loyalty'
          }, {
            label: 'Date Quoted',
            sortable: false
          }, {
            label: 'Total',
            sortable: false
          }
        ],
        user: null,
        data: [],
        rateOfReturn: null
      }
    }
  }
</script>

<style lang="scss">
  @import '~@hybrid-cloud/cirrus-vue/src/globals/scss/cirrus-globals';
  .headerDivider {
    padding: 10px;
    border-color: black;
    border-width: 3px;
    border-bottom-style: solid;
  }
  .cardHeader {
    text-align: left !important;
    margin: 15px 0 5px;
  }
</style>
