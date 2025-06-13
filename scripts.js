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
                    <td></td>
                    <td class="invalid-username">User does not exist on habbo!</td>
                `;
                tableBody.appendChild(row);
            } else if (userResponse.status == 503) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${username}</td>
                    <td></td>
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
                    const mottoClass = userData.motto.includes("RCN") || userData.motto.includes("CA") ? "" : "motto-highlight";
                    const row = document.createElement("tr");

                    row.innerHTML = `
                    <td>${username}</td>
                    <td class="${mottoClass}">${userData.motto}</td>
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
        console.log("Extracted JSON Data:", userData);

        let hasSubmittedBGC = "Unknown";
        let bgcAccepted = "Unknown";

        if (userData.props.person) {
            hasSubmittedBGC = userData.props.person.has_submitted_bgc === 1 ? "True" : "False";
            bgcAccepted = userData.props.person.background_check_id;
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


/* 
################
BOS / NP CHECKER
################
*/

const boslist = {
    "Interpol": {
        "link": "https://inthabbo.net/ban-on-sight/",
        "usernames": [
            "LucyGxx29/carefulwtyousay/rosielee20161  ",
            "victorgabr_90  ",
            "jansen00-/jansen1234r/-Sharkboy-  ",
            "tulikacullen/YallHeauxMad  ",
            "ForgotMyDog  ",
            "Ali21./Ali14.  ",
            "hungryalifp  ",
            "StarMendezzz  ",
            "Renzooooooo  ",
            ":.SecretElder.:  ",
            "SpookySpider/COMAXIOM  ",
            "samira..  ",
            "Kearley  ",
            "666leah  ",
            "SarahSmithBAN  ",
            "unlaced_  ",
            "LittleDuckling  ",
            "Lucy_is_ded/.bean.  ",
            "Berat  ",
            "queenclassy  ",
            "AlphaReborn  ",
            "pepe-maker  ",
            "AlisonWiltshire/EvelynAlberry/JosalinaGolden  ",
            "rensesme  ",
            "Mannyy  ",
            "Pokemoners/David:  ",
            "StinkyObama/HotArjunHot  ",
            "Bruxelles/DeLeTeD_UsEr  ",
            "M_il_an/SIDD  ",
            "=x=Nikki=x=  ",
            "Johnny15Adam  ",
            "nicegirls45  ",
            "SlayerDune  "
        ]
    },
    "United Nations": {
        "link": "https://habboun.com/pages/ban-sight",
        "usernames": [
            "Crept",
            "Harvoar",
            "Apical",
            "Vaporizer",
            "Zorloft",
            "Wxlshyy",
            "-avocadorable",
            "OmegaSubZero",
            "-Charles",
            "Lewis8261",
            "AbsolutSlayer",
            "-GoldBars.-",
            "JKN27",
            "Cronology",
            "ItsMak",
            "XxxTrayxxX",
            "SGTDawson",
            "PandaCrunch"
        ]
    },
    "Secret Service": {
        "link": "https://habboss.org/units/ea/np/",
        "usernames": [
            "Zealing",
            "MyNameisB0aty",
            "Stevo127",
            "FBI-Operator",
            "@Badges",
            "TateLynn90",
            "eric903",
            "Torsten,",
            "Jakeedog",
            "Youngleen",
            "Ailex (AIlex)",
            "Yodasbathtub",
            "Pete-P",
            "Chandiee",
            "Mostafaomar",
            "Rubix",
            "LLegs",
            "Kevchi",
            ".onomanopia",
            "Will_VT",
            "Mostafamoha.",
            "liamkeats",
            "Conditioners",
            "Jordann::",
            "Hopps_12345",
            "nicolesky25",
            "Sam_Lay123",
            "Unykorn"
        ]
    },
    "Habbo Defence Agency": {
        "link": "https://www.hda-habbo.com/national-punishment.html",
        "usernames": [
            "HabibiOmar",
            "jubxz",
            "funkyshuck",
            "SeargentElmo",
            "Leiandros",
            "KingTray18",
            "GhostJoeliff/hopps_1234",
            "RossGXC",
            "Hiow",
            "izzy3134",
            "\,3p?",
            "ANIMAX/ST.Arcumbs",
            "Rockmanvincent",
            "hollister312",
            "Brian\,\,\,\,\,",
            ".colourpencils/,gummyworms",
            "Purigatory",
            "Giloblastoma",
            "Hiow...",
            "HX7",
            "JasonBourne_",
            "Jiggle/Any Alts",
            "KingJason3.",
            "Lani956",
            "louis3856",
            "melwinthebig",
            "michelle-xixu",
            "Pabboi",
            "PhDJayBryan",
            "Skrosis",
            "spyjthecrazy",
            "TheLegendshere",
            "TonyStar_",
            "Toxicator",
            "Txrbo/cvcifer",
            "Kittyevpixie",
            "Glenda.Smith",
            "XLaCosaNostraX / jordy77863",
            "sohelpmealex",
            "StinkyObama / HotArjunHot / Any Alts",
            ".OnomanopiaValore - alt Understudy",
            ":-JamJar-:",
            "tjw162",
            "ChalIenge",
            "Sebbi",
            "Jiggle / Any Alts",
            "funkyshuck",
            "Klausmikaelson / Any Alts",
            "Jordan:: / Any Alts",
            "HDA-George / FlyDifferentNZ/georgeygeorge / Any Alts",
            "timmyfimple",
            "Kiyah09",
            "StinkyObama / HotArjunHot / Any Alts",
            "Ali14.",
            "Charlott1626 / CH4R"
        ]
    },
    "Habbo Intelligence Agency": {
        "link": "https://www.hiahabbo.com/bos--np.html",
        "usernames": [
            "SoPhIstiC@TioNS  ",
            "Freedom996  ",
            "jurian771/jurian71/juriann71  ",
            "Poseide  ",
            "Mannyy  ",
            "Anonymity/vaporizer  ",
            "Armatus  ",
            "Crystal  ",
            "lil!devil!/TomJ/Zotad  ",
            "SeaFury  ",
            "Kemyst  ",
            "Plalism  ",
            "-,Shadow,-/Disassociate  ",
            "Valentino  ",
            "Jollity  ",
            "Sohelpmealex  ",
            "lmaojkitty/Verbal  ",
            "Aelonis  ",
            "AliasHog/Yaeloman  ",
            "Crayans  ",
            "Ganaram/Ganaham/G4n/Gana  ",
            "Lucifist/Soprano  ",
            "Macaw  ",
            "Menacers  ",
            "Metromental/Effectivity/Finchy/YFL  ",
            "Rethrone/motolee28  ",
            "Skotesh  ",
            "SmurfPapas/Erebes  ",
            "Ali21/Ali14  ",
            "Genovese  ",
            "God  ",
            "Jedicon/Egotist/QuarantineHabbo/FruitJellies  ",
            "barbersyeds  ",
            "supbruvfam  ",
            "Mooody  ",
            "jackson8ryan/Tumon360  ",
            "Onomanopia/understudy  ",
            "Valore  ",
            "Will_vt  ",
            "M-?  ",
            "iWail/iWail-NL  ",
            "Aestrol/Ezco/TheRealAestrol/Tripical  ",
            "Serpented/Drenched  ",
            "Optimisation  ",
            "68What/Airborne68W/DUSTOFF/GermanyBoi  ",
            "Cupcakes.../NotKayla./Hateable  ",
            "Billionnames/BrunoChrist  ",
            "Mahigan/Kodaz  ",
            "Verol/ThePoint  ",
            "cfc.forever  "
        ]
    }
}

document.getElementById("bos-manual-check").addEventListener("click", async function () {
    const tableBody = document.getElementById("bos-results");

    try {
        const usernameInput = document.getElementById("bos-manual-input").value;
        tableBody.innerHTML = "";

        for (const agency in boslist) {
            const { link, usernames } = boslist[agency];

            for (const entry of usernames) {
                //console.log(`checking "${usernameInput}" against "${entry}"`); // debugging , early stage
                if (entry.toLowerCase().includes(usernameInput.toLowerCase())) {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${agency}</td>
                        <td><a href="${link}" target="_blank">${agency}</a></td>
                    `;
                    tableBody.appendChild(row);
                    found = true;
                }
            }
        }
    } catch (error) {
        console.error("Error during BOS check:", error);
    }
});