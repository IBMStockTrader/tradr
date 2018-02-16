/*
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
 */
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)


export const store =  new Vuex.Store({
    // You can use it as state property
    state: {
        userName: "No Name",
        userData: {},
        jwt_token: ""
    },

    // You can use it as a state getter function (probably the best solution)
    getters: {
        userName: state => {
            // console.log(state);
            if(state.userName){
                return state.userName;
            }else{
                return state.userData.id;
            }
        },
        jwtToken: state => {
            return state.jwt_token;
        }
    },

    // Mutation for when you use it as state property
    mutations: {
        userName(state, payload) {
            state.userName = payload.userName
            state.userData = payload.userData
            state.jwt_token = payload.jwt_token
        }
    },

    actions: {
        // Perform VueAuthenticate login using Vuex actions
        userName(context) {
            axios.get('user/', {headers: {'Authorization': 'Bearer '+localStorage.getItem("user_jwt")}}).then(response => {
                if (response.data === null) {
                    console.log('no session on response')
                } else {
                    localStorage.setItem("userName", response.data.session.user.displayName);
                    localStorage.setItem("userData", response.data.session.user._json);
                    localStorage.setItem("user_jwt", response.data.token);
                    // console.log(response.data);
                    context.commit('userName', {
                        userName: response.data.session.user.displayName,
                        userData: response.data.session.user._json,
                        jwt_token: response.data.token
                    })
                }
            });
        }
    }
})
