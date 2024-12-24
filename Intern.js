const csvUrl = 'https://raw.githubusercontent.com/shaktids/stock_app_test/refs/heads/main/dump.csv';
let indexData = [];
let indexNames = [];
let currentPage = 0;
const indexesPerPage = 10; // Number of Companies to load per page

// Fetch and parse the CSV data
fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
        // Parse CSV using PapaParse
        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                indexData = results.data;
                console.log('Parsed Index Data:', indexData);  // Debugging: Log the raw data
                indexNames = Array.from(new Set(indexData.map(item => item.index_name)));  // Get unique Companies names
                loadPage(0); // Load the first page of Companies
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching CSV:', error);
    });

// Load a specific page of Companies names
function loadPage(page) {
    if (page < 0 || page * indexesPerPage >= indexNames.length) {
        return;
    }
    currentPage = page;
    const currentIndexes = indexNames.slice(currentPage * indexesPerPage, (currentPage + 1) * indexesPerPage);
    populateIndexList(currentIndexes);
    updatePagination();
}

// Populate the list of Companies
function populateIndexList(indexNames) {
    const indexListElement = document.getElementById('indexes');
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'none';  // Hide loading message
    indexListElement.innerHTML = '';  // Clear the previous list

    indexNames.forEach(indexName => {
        const li = document.createElement('li');
        li.textContent = indexName;
        li.addEventListener('click', () => displayChartForIndex(indexName));
        indexListElement.appendChild(li);
    });
}

// Update the pagination buttons
function updatePagination() {
    const totalIndexes = indexNames.length;
    document.getElementById('prev').disabled = currentPage === 0;
    document.getElementById('next').disabled = (currentPage + 1) * indexesPerPage >= totalIndexes;
}

// Display the chart for the selected Company
function displayChartForIndex(indexName) {
    const filteredData = indexData.filter(item => item.index_name === indexName);
    console.log('Filtered Data for', indexName, filteredData);  // Debugging: Log filtered data for the index

    if (!filteredData || filteredData.length === 0) {
        console.warn('No data available for the selected index:', indexName);
        return;
    }

    const labels = filteredData.map(item => item.index_date); // Dates
    const closingValues = filteredData.map(item => parseFloat(item.closing_index_value)); // Closing values of the index

    // Destroy previous chart if it exists
    const chartElement = document.getElementById('stock-chart');
    if (window.stockChart) {
        window.stockChart.destroy();
    }

    // Create a new chart using Chart.js
    const ctx = chartElement.getContext('2d');
    window.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${indexName} Index Closing Value`,  // Corrected template literal syntax
                data: closingValues,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Index Closing Value (₹)'
                    }
                }
            }
        }
    });
}


