document.getElementById("fetchData").addEventListener("click", async function() {
    const githubRawUrl = "https://raw.githubusercontent.com/shotgunbooter/awol-check/refs/heads/main/names.txt"; 
    const tableBody = document.getElementById("results");

    try {
        // Fetch the list of usernames
        const response = await fetch(githubRawUrl);
        const data = await response.text();
        const usernames = data.split("\n").map(name => name.trim()).filter(name => name);

        tableBody.innerHTML = ""; // Clear table before inserting new data

        for (const username of usernames) {
            const habboApiUrl = `https://www.habbo.com/api/public/users?name=${encodeURIComponent(username)}`;
            const userResponse = await fetch(habboApiUrl);

            if (userResponse.status == 404) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${username}</td>
                    <td class="invalid-username">User does not exist on habbo!</td>
                `;
                tableBody.appendChild(row);
            } else if (userResponse.status == 503) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${username}</td>
                    <td class="maintenance">Habbo is under maintenance, Try later.</td>
                `;
                tableBody.appendChild(row);
                alert("Habbo is undergoing maintenance, Try again later.")
                break;
            } else {
                const userData = await userResponse.json();
                
                if (userData.lastAccessTime) {
                    const lastLogin = new Date(userData.lastAccessTime);
                    const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));
                    
                    const row = document.createElement("tr");
                    row.innerHTML = `
                    <td>${username}</td>
                    <td class="${daysSinceLogin > 10 ? 'awol' : ''}">${daysSinceLogin}</td>
                    `;
                    tableBody.appendChild(row);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

document.getElementById("manual-check").addEventListener("click", async function() {
    const tableBody = document.getElementById("manual-resutls");
    const username = document.getElementById("manual-input").value

    try {
        const data = await document.getElementById("manual-input").innerText.toString()
        tableBody.innerHTML = "";

        const habboApiUrl = `https://www.habbo.com/api/public/users?name=${encodeURIComponent(username)}`;
        const userResponse = await fetch(habboApiUrl);

        if (userResponse.status == 404 || userResponse.status == 400) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${username}</td>
                <td class="invalid-username">User does not exist on habbo!</td>
            `;
            tableBody.appendChild(row);
        } else {
            const userData = await userResponse.json();
            
            if (userData.lastAccessTime) {
                const lastLogin = new Date(userData.lastAccessTime);
                const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));
                
                const row = document.createElement("tr");
                row.innerHTML = `
                <td>${username}</td>
                <td class="${daysSinceLogin > 10 ? 'awol' : ''}">${daysSinceLogin}</td>
                `;
                tableBody.appendChild(row);
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

/* 
################
BGC VALIDATOR
################
*/
document.getElementById("validate-bgc").addEventListener("click", async function () {
    const tableBody = document.getElementById("bgc-results");
    const username = document.getElementById("bgc-input").value;

    try {
        tableBody.innerHTML = "";

        // list for fuuture: https://corsproxy.io/
        // https://nordicapis.com/10-free-to-use-cors-proxies/
        const habboApiUrl = `https://corsproxy.io/?url=https://habbo-ca.com/personnel/${encodeURIComponent(username)}`;
        const userResponse = await fetch(habboApiUrl);

        if (userResponse.status === 404 || userResponse.status === 400) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${username}</td>
                <td class="invalid-username">User does not exist on CAF PTS</td>
                <td class="invalid-username">-</td>
            `;
            tableBody.appendChild(row);
            return;
        }

        const htmlText = await userResponse.text();

        const match = htmlText.match(/<div id="app"[^>]*data-page="([^"]+)"/);
        if (!match || !match[1]) {
            console.error("data-page attribute not found in response");
            return;
        }

        const jsonData = match[1].replace(/&quot;/g, '"');
        const userData = JSON.parse(jsonData);
        // console.log("Extracted JSON Data:", userData);

        let hasSubmittedBGC = "Unknown";
        let bgcAccepted = "Unknown";

        if (userData.props.person) {
            hasSubmittedBGC = userData.props.person.has_submitted_bgc === 1 ? "True" : "False";
            bgcAccepted = userData.props.person.background_check_id !== null ? "True" : "False";
        } else {
            console.error("Invalid response structure, 'person' key missing.");
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${username}</td>
            <td class="bgc-submitted-field">${hasSubmittedBGC}</td>
            <td class="bgc-accepted-field">${bgcAccepted}</td>
        `;
        tableBody.appendChild(row);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
