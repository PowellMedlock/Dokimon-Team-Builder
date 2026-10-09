import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const EMPTY_TEAM = Array(6).fill("");

const CATEGORY_LABELS = {
    IMMUNE: "0×",
    RESIST_1_4: "¼×",
    RESIST_1_2: "½×",
    NEUTRAL: "1×",
    WEAK_2: "2×",
    WEAK_4: "4×",
};


/* gets the images set in /public/images to use in the app */

function getTypeIcon(type) {
    return `/images/type-icons/${type.toLowerCase()}.png`;
}

function getDokimonSprite(dokimon) {
    return `/images/dokimon/${dokimon.number}.png`;
}


// Main App

function App() {
    const [dokimon, setDokimon] = useState([]);
    const [team, setTeam] = useState(EMPTY_TEAM);
    const [analysis, setAnalysis] = useState(null);

    const [loadingRoster, setLoadingRoster] = useState(true);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const [error, setError] = useState("");


    // Loads Dokimon roster from the Springboot Backend

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/dokimon`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Could not load the Dokimon roster.");
                }

                return response.json();
            })
            .then((data) => {
                setDokimon(data);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoadingRoster(false);
            });
    }, []);


    // turns the roster from the backend into something easier to be found by name

    const dokimonByName = useMemo(() => {
        return new Map(
            dokimon.map((d) => [
                d.name.toLowerCase(),
                d,
            ])
        );
    }, [dokimon]);


    const selectedCount = team.filter(Boolean).length;

    const isComplete = selectedCount > 0;


    // sets the

    function updateSlot(index, value) {
        const nextTeam = [...team];

        nextTeam[index] = value;

        setTeam(nextTeam);
        setAnalysis(null);
        setError("");
    }


    /* removes all selected Dokimon from the input section of the app, done when hitting the clear button*/

    function clearTeam() {
        setTeam([...EMPTY_TEAM]);
        setAnalysis(null);
        setError("");
    }


    /* Searches through dokimon.json in the backend for the 1-6 dokimon in the input, then sends the POST request to the backend to process the request*/

    async function analyzeTeam() {
        if (!isComplete) {
            setError(
                "Choose at least 1 Dokimon before analyzing the team."
            );

            return;
        }

        setLoadingAnalysis(true);
        setError("");
        // POST request to the backend
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/team-builder/analyze`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        //remove empty slots so they aren't sent to the backend
                        dokimon: team.filter(Boolean),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "The team analysis failed."
                );
            }

            setAnalysis(data);

        } catch (err) {
            setError(err.message);
            setAnalysis(null);

        } finally {
            setLoadingAnalysis(false);
        }
    }


    // formatting

    return (
        <div className="app-shell">

            {/* Header and Title*/}

            <header className="hero">

                <div className="hero-content">

                    <div>

                        <p className="eyebrow">
                            DOKIMON QUEST
                        </p>

                        <h1>
                            Team Builder
                        </h1>

                        <p className="hero-copy">
                            Build a team of up to six Dokimon and see exactly
                            where your team is vulnerable, neutral, resistant,
                            or immune.
                        </p>

                    </div>


                    <div className="type-count">

                        <strong>
                            {dokimon.length + " " || "—"}
                        </strong>

                        <span>
                             Dokimon available
                        </span>

                    </div>

                </div>

            </header>


            {// main content class
            }

            <main className="main-content">


                {// team panel format
                }

                <section className="team-panel">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Build Your Team
                            </h2>

                        </div>


                        <button
                            className="secondary-button"
                            onClick={clearTeam}
                        >
                            Clear
                        </button>

                    </div>


                    {// set up for 6 team slots
                    }

                    <div className="team-grid">

                        {team.map((selectedName, index) => (

                            <TeamSlot
                                key={index}

                                index={index}

                                value={selectedName}

                                dokimon={dokimon}

                                dokimonByName={dokimonByName}

                                disabled={loadingRoster}

                                onChange={updateSlot}
                            />

                        ))}

                    </div>


                    {//allows the user to click a button and begin the analysis of their Dokimon team
                    }

                    <div className="actions">

                        <div className="status">

                            {selectedCount > 0
                                ? `${selectedCount}/6 Dokimon selected`
                                : "Select at least 1 Dokimon"}

                        </div>


                        <button
                            className="primary-button"

                            onClick={analyzeTeam}

                            disabled={
                                !isComplete ||
                                loadingAnalysis ||
                                loadingRoster
                            }
                        >

                            {loadingAnalysis
                                ? "Analyzing..."
                                : "Analyze Team"}

                        </button>

                    </div>


                    {//error handling
                    }

                    {error && (

                        <div className="error-box">
                            {error}
                        </div>

                    )}

                </section>


                {// displaying results
                }

                {analysis ? (

                    <CoverageChart
                        analysis={analysis}
                    />

                ) : (

                    <EmptyState
                        complete={isComplete}
                    />

                )}

            </main>


            {/* Basic footer for formatting*/}

            <footer>
                Dokimon Quest Team Builder
            </footer>

        </div>
    );
}


// Sets up auto-search for the listed Dokimon

function TeamSlot({
                      index,
                      value,
                      dokimon,
                      dokimonByName,
                      disabled,
                      onChange,
                  }) {
    // gets the name of a Dokimon
    const selected = value
        ? dokimonByName.get(
            value.toLowerCase()
        )
        : null;


    /*
     Search text is kept separate from the selected
     Dokimon so users can type without immediately
     selecting something.
     */

    const [search, setSearch] = useState(
        value || ""
    );

    const [isOpen, setIsOpen] = useState(false);


    // Keep search text in sync with selected value


    useEffect(() => {
        setSearch(value || "");
    }, [value]);


    // Finds Dokimon that match the name input

    const matches = useMemo(() => {

        const query = search
            .trim()
            .toLowerCase();


        // Empty search = show the entire roster.


        if (!query) {
            return dokimon;
        }


        //Otherwise show names containing the typed text.


        return dokimon.filter((d) =>
            d.name
                .toLowerCase()
                .includes(query)
        );

    }, [search, dokimon]);


    /* React captures the typing on the keyboard and gives the sequence of typed letters to the
     search function to find which Dokimon have the sequence of letters in their name*/

    function handleInputChange(event) {

        const newValue =
            event.target.value;

        setSearch(newValue);

        setIsOpen(true);


        //If the user edits the selected name, clear the selected Dokimon.



        if (
            newValue !== selected?.name
        ) {
            onChange(index, "");
        }
    }


    // sets a selected Dokimon into the field it was typed into

    function selectDokimon(d) {

        setSearch(d.name);

        setIsOpen(false);

        onChange(index, d.name);
    }


    // resets the search value in a field

    function clearSelection() {

        setSearch("");

        setIsOpen(false);

        onChange(index, "");
    }


    // setup for each of the 6 team slots

    return (

        <div className="team-slot">


            {//inputs the
            }

            <div className="slot-number">
                {index + 1}
            </div>


            {// setup for input and types
            }

            <div className="slot-content">


                {// search input for the frontend so if the user types a sequence of letters, it will find Dokimon with that letter sequence in the name.
                    }

                <div className="search-container">

                    <div className="search-input-wrapper">

                        <input
                            type="text"

                            value={search}

                            disabled={disabled}

                            placeholder="Search Dokimon..."

                            onChange={handleInputChange}

                            onFocus={() =>
                                setIsOpen(true)
                            }

                            onBlur={() => {

                                /*
                                 * Delay closing so clicking a result
                                 * still works.
                                 */

                                setTimeout(() => {
                                    setIsOpen(false);
                                }, 150);

                            }}
                        />


                        {// formatting the clear button
                             }

                        {search && (

                            <button
                                type="button"

                                className="clear-search"

                                onMouseDown={(event) =>
                                    event.preventDefault()
                                }

                                onClick={clearSelection}

                                aria-label={
                                    `Clear slot ${index + 1}`
                                }
                            >
                                ×
                            </button>

                        )}
                        {selected && (

                            <div className="selected-types">

                                {selected.types.join("/")}

                            </div>

                        )}

                    </div>


                    {// search results
                    }

                    {isOpen && !disabled && (

                        <div className="search-results">

                            {matches.length > 0 ? (

                                matches.map((d) => (

                                    <button
                                        type="button"

                                        className="search-result"

                                        key={d.number}

                                        onMouseDown={(event) =>
                                            event.preventDefault()
                                        }

                                        onClick={() =>
                                            selectDokimon(d)
                                        }
                                    >

                    <span className="result-number">
                      #{d.number}
                    </span>


                                        <span className="result-name">
                      {d.name}
                    </span>


                                        <span className="result-types">
                      {d.types.join(" / ")}
                    </span>

                                    </button>

                                ))

                            ) : (

                                <div className="no-results">
                                    No Dokimon found
                                </div>

                            )}

                        </div>

                    )}

                </div>


                {//
                }


            </div>

        </div>
    );
}


// formatting for the coverage chart

function CoverageChart({
                           analysis,
                       }) {

    const team =
        analysis.team;


    return (

        <section className="results-panel">


            {// header
            }

            <div className="results-heading">

                <div>

                    <p className="section-kicker">
                        TYPE COVERAGE
                    </p>

                    <h2>
                        Defensive Matchups
                    </h2>

                </div>


                {//legend
                }



            </div>


            {//table formatting setup
            }

            <div className="table-wrap">

                <table className="coverage-table">

                    <thead>

                    <tr>


                        {//type header
                        }

                        <th className="type-header">
                            Type
                        </th>


                        {// dokimon column header setup
                        }

                        {team.map((d, index) => (

                            <th
                                key={`${d.name}-${index}`}

                                className="dokimon-column-header"
                            >

                                <img
                                    className="dokimon-sprite"

                                    src={getDokimonSprite(d)}

                                    alt={d.name}

                                    title={d.name}

                                    onError={(event) => {
                                        console.error(
                                            "SPRITE FAILED:",
                                            event.currentTarget.src
                                        );
                                    }}

                                    onLoad={(event) => {
                                        console.log(
                                            "SPRITE LOADED:",
                                            event.currentTarget.src
                                        );
                                    }}
                                />

                            </th>

                        ))}


                        {// headers for count of how many dokimon are weak, and resistant/immune to certain types
                        }

                        <th className="summary-header">
                            Weak
                        </th>

                        <th className="summary-header">
                            Resist / Immune
                        </th>

                    </tr>

                    </thead>


                    {// setup for the body of the table
                    }

                    <tbody>

                    {analysis.rows.map((row) => (

                        <tr
                            key={row.type}
                        >


                            {/* ===========================================
                    TYPE ICON
                    =========================================== */}

                            <th className="row-type">

                                <img
                                    className="type-icon"

                                    src={getTypeIcon(row.type)}

                                    alt={row.type}

                                    title={row.type}

                                    onError={(event) => {
                                        console.error(
                                            "TYPE ICON FAILED:",
                                            event.currentTarget.src
                                        );
                                    }}

                                    onLoad={(event) => {
                                        console.log(
                                            "TYPE ICON LOADED:",
                                            event.currentTarget.src
                                        );
                                    }}
                                />

                            </th>


                            {/* ===========================================
                    MATCHUP CELLS
                    =========================================== */}

                            {row.matchups.map(
                                (matchup, index) => (

                                    <td
                                        key={`${matchup.type}-${index}`}
                                    >

                                        <MatchupCell
                                            matchup={matchup}
                                        />

                                    </td>

                                )
                            )}


                            {// count of Dokimon weak to a type
                            }

                            <td
                                className={
                                    `summary-cell ${
                                        row.weakCount > 0
                                            ? "summary-weak"
                                            : ""
                                    }`
                                }
                            >

                                {row.weakCount}

                            </td>


                            {// count of Dokimon resistant or immune to a type
                            }

                            <td
                                className={
                                    `summary-cell ${
                                        row.resistantOrImmuneCount > 0
                                            ? "summary-resist"
                                            : ""
                                    }`
                                }
                            >

                                {row.resistantOrImmuneCount}

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>


            {//
            }

            <div className="chart-note">

                Weak counts include 2× and 4× damage.
                Resist / Immune counts include ½×,
                ¼×, and 0× damage.

            </div>

        </section>
    );
}


//sets up display of type matchups

function MatchupCell({
                         matchup,
                     }) {

    const className = {

        WEAK_4: "weak4",

        WEAK_2: "weak2",

        NEUTRAL: "neutral",

        RESIST_1_2: "resist2",

        RESIST_1_4: "resist4",

        IMMUNE: "immune",

    }[matchup.category] || "neutral";


    return (

        <div
            className={`matchup ${className}`}
        >

            <strong>

                {CATEGORY_LABELS[
                    matchup.category
                    ] ?? `${matchup.multiplier}×`}

            </strong>

        </div>

    );
}


//Legend setup

function LegendItem({
                        className,
                        label,
                    }) {

    return (

        <span className="legend-item">

      <span
          className={
              `legend-swatch ${className}`
          }
      />

            {label}

    </span>

    );
}


/* EmptyState prints under the build team bar, simply explaining what the app will do, and shifting the text based on if any Dokimon are typed into the columns*/

function EmptyState({
                        complete,
                    }) {

    return (

        <section className="empty-state">


            <div className="empty-icon">
                ⚔
            </div>


            <h2>

                {complete
                    ? "Ready to analyze"
                    : "Your chart will appear here"}

            </h2>


            <p>

                Select up to six Dokimon above,
                then click <strong>Analyze Team </strong>
                to calculate every type matchup.

            </p>

        </section>

    );
}


// export

export default App;