document.getElementById("fetchData").addEventListener("click", async function() {
    const githubRawUrl = "https://raw.githubusercontent.com/shotgunbooter/username-list/refs/heads/main/names.txt"; 
    const tableBody = document.getElementById("results");

    try {
        // Fetch the list of usernames
        const response = await fetch(githubRawUrl);
        const data = await response.text();
        const usernames = data.split("\n").map(name => name.trim()).filter(name => name);

        tableBody.innerHTML = ""; // Clear table before inserting new data

        for (const username of usernames) {
            const habboApiUrl = `https://www.habbo.com/api/public/users?name=${username}`;
            const userResponse = await fetch(habboApiUrl);

            if (userResponse.status == 404) {
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
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
