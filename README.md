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

# tradr

This is a new Node.js-hosted and Vue.js-based user interface for StockTrader.  It calls the default `portfolio` 
JAX-RS web services when interacting with stock portfolios. As such `portfolio` must be exposed via ingress for `tradr`
 to work properly.
 
*Note:* There is a bug where the UI does not function if the portfolio database is empty.  
 
 ### Prerequisites
 Along with the `jwt` and `oidc` secrets required for the `trader` service to work `tradr` requires a secret defining
  the ingress host and port where `tradr` will run.  You create this secret by running:
  ```bash
  kubectl create secret generic ingress-host --from-literal=host=<PROXY_HOSTNAME>:<PROXY_SSL_PORT>
  
  # Example:
  kubectl create secret generic ingress-host --from-literal=host=myicpproxy.ibm.com:443
  
  # Or
  kubectl create secret generic ingress-host --from-literal=host=myicpproxy.ibm.com:443 -n stock-trader
  ```
  
  You'll also need to enable login to the IBM Cloud Private internal Docker registry by following [these steps]
  (https://www.ibm.com/support/knowledgecenter/en/SSBS6K_2.1.0/manage_images/configuring_docker_cli.html).  Don't 
  forget to restart Docker after adding your cert.  On macOS you can restart Docker by running:
  ```bash
  osascript -e 'quit app "Docker"'
  open -a Docker
  ```
 
 ### Build and Deploy 
To build `tradr` clone this repo and run:
```bash
docker build -t tradr:latest -t <ICP_CLUSTER>.icp:8500/stock-trader/tradr:latest .
docker tag tradr:latest <ICP_CLUSTER>.icp:8500/stock-trader/tradr:latest
docker push <ICP_CLUSTER>.icp:8500/stock-trader/tradr:latest

kubectl apply -f manifests/
```

In practice this means you'll run something like:
```bash
docker build -t tradr:latest -t mycluster.icp:8500/stock-trader/tradr:latest .
docker tag tradr:latest mycluster.icp:8500/stock-trader/tradr:latest
docker push mycluster.icp:8500/stock-trader/tradr:latest

kubectl --namespace stock-trader apply -f manifests/
```

Once the `tradr` containers start you can reach the new UI by navigating to 
[https://<PROXY_HOSTNAME>:<PROXY_SSL_PORT>/tradr](https://<PROXY_HOSTNAME>:<PROXY_SSL_PORT>/tradr).  Using the 
previous example that is: [https://myicpproxy.ibm.com/tradr](https://myicpproxy.ibm.com/tradr) (since https is port 
443 you can drop the ssl port from the URL in this example).