//showcards.js


let pageSize;
let allData;
let currentPage;
let modsData;
let otherData;
let filteredData;


window.addEventListener('load', function() {
  saveToStorageHandleInitialURLParams();
  // Call loadFromStorageHandleInitialURLParams to apply filters when the page is loaded
  loadFromStorageHandleInitialURLParams();
});



// Function to create a card for each mod
function createModCard(mod) {
  const card = document.createElement('div');
  card.classList.add('card');

  // Determine the status class based on priority
  let statusClass = getStatusClass(mod);

  // Only add the status class if it's not empty
  if (statusClass) {
    card.classList.add(statusClass); // Add the status class to the card
  }

  card.id = `${mod.id}`;

  // Populate the card with mod data
  card.innerHTML = `
    <div class="TopCardContainer">
      <div class="itemid" id="${mod.id}"><span>id ${mod.id}</span></div>
      <div class="cardimage" style="background-image: url('${mod.image}')" title="${mod.title} Image" style="max-width: 100%;"></div>
      <div id="${mod.id}" class="textContainer"><h2 class="modtitle">${mod.title}</h2>
      <p>від <span title="${(mod.author)}" class="author">${truncateText(mod.author, 35)}</span></div>
    </div>
  `;

  const descriptionContainer = document.createElement('div');
  descriptionContainer.classList.add('description-container');
  card.appendChild(descriptionContainer);

  const shortDescription = document.createElement('p');
  shortDescription.classList.add('short-description');
  shortDescription.innerText = mod.description.length > 100 ? mod.description.substring(0, 100) + '...' : mod.description;
  descriptionContainer.appendChild(shortDescription);

// Add icons based on status
if (statusClass) {
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('IconContainer');

  // Use Promise to get icon data
  addIcon(iconContainer, statusClass);

  // Append the IconContainer to descriptionContainer
  descriptionContainer.appendChild(iconContainer);
}

  // Add a click event listener to redirect to the item page when clicking on cardimage or textContainer
  const clickableElements = card.querySelectorAll('.cardimage, .modtitle');
  clickableElements.forEach(element => {
    element.addEventListener('click', (event) => {
      // Prevent following the link if the click is not on cardimage or textContainer
      if (!event.target.classList.contains('cardimage') && !event.target.classList.contains('modtitle')) {
        return;
      }

      // Extract the mod ID from the clicked card
      const modId = mod.id;

      // Redirect to item.html with the mod ID as a query parameter
      window.location.href = `item.html?id=${modId}`;
    });
  });

  // Append the card to the CardsContainer
  document.querySelector('.CardsContainer').appendChild(card);
}



// Function to get the status class based on mod properties
function getStatusClass(mod) {
  if (mod.completed === false) {
    return 'completed';
  } else if (mod.semiverified === true) {
    return 'semiverified';
  } else if (mod.verified === true) {
    return 'verified';
  }
  // Return an empty string if none of the conditions match
  return '';
}

// Function to get icon data from Icons.json
function getIconData(statusClass) {
  // Replace this with the actual path to your Icons.json file
  const iconsJsonPath = 'icons.json';

  // Return a Promise for fetching and processing the icon data
  return fetch(iconsJsonPath)
    .then(response => response.json())
    .then(iconData => iconData[statusClass] || {})
    .catch(error => {
      console.error('Error fetching icon data:', error);
      return {};
    });
}

// Function to add icons based on status
function addIcon(element, type) {
  const iconContainer = document.createElement('div');

  // Use Promise to get icon data
  getIconData(type).then(iconData => {
    if (iconData.icon) {
      iconContainer.title = iconData.title || '';
      iconContainer.style.backgroundImage = `url('${iconData.icon}')`;
      iconContainer.classList.add(`statusicon`, `${type}Icon`);
      element.appendChild(iconContainer);
    }
  });
}


function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  } else {
    return text;
  }
}


// Function to display cards based on the current page
function displayCards(currentPage, pageSize, data) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentData = data.slice(startIndex, endIndex);

  // Check if the container exists before setting innerHTML
  const cardsContainer = document.querySelector('.CardsContainer');
  if (cardsContainer) {
      // Clear existing cards
      cardsContainer.innerHTML = '';
      currentData.forEach(item => createModCard(item)); // Replace createCard with createModCard
  } else {
      console.error("Error: Cards container not found!");
  }
}

// Function to display page numbers
function displayPageNumber(pageNumber, isActive) {
  const pagesContainer = document.getElementById('Pages');

  const pageElement = document.createElement('div');
  pageElement.classList.add('page-number');
  if (isActive) {
    pageElement.classList.add('ActivePage');  // Add ActivePage class if the page is active
  }
  pageElement.textContent = pageNumber;

  pageElement.addEventListener('click', () => navigatePage(pageNumber, totalPages));

  pagesContainer.appendChild(pageElement);
}

// Function to update the number of pages and display page navigation
function updatePageNavigation(currentPage, pageSize, filteredData) {
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagesContainer = document.getElementById('Pages');

  pagesContainer.innerHTML = ''; // Clear existing navigation buttons

  const displayPageNumber = (pageNumber) => {
    const isActive = pageNumber === currentPage;
    pagesContainer.innerHTML += `
      <div class="page-number ${isActive ? 'ActivePage' : ''}" onclick="navigatePage(${pageNumber}, ${totalPages})">${pageNumber}</div>
    `;
  };

  const displayEllipsis = () => {
    pagesContainer.innerHTML += `
      <div class="ellipsis">...</div>
    `;
  };

  const displayLastPage = () => {
    const isActive = totalPages === currentPage; // Check if it's the last page
    pagesContainer.innerHTML += `
      <div class="page-number ${isActive ? 'ActivePage' : ''}" onclick="navigatePage(${totalPages}, ${totalPages})">${totalPages}</div>
    `;
  };

  // Display the first page number
  displayPageNumber(1);

  if (currentPage > 4) {
    displayEllipsis();
  }

  for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
    displayPageNumber(i);
  }

  if (currentPage < totalPages - 3 && totalPages > 5) {
    displayEllipsis();
  }

  if (totalPages > 1) {
    displayLastPage();
  }
}




// Function to navigate between pages
function navigatePage(newPage, totalPages) {
  if (!isNaN(newPage) && newPage >= 1) {
      // Ensure the requested page is within valid bounds
      const targetPage = Math.min(newPage, totalPages);

      console.log(`Navigating to page: ${targetPage}, total pages: ${totalPages}, current page: ${currentPage}`);

      if (targetPage !== currentPage) {
          currentPage = targetPage;  // Update currentPage
          updateURL(currentPage);  // Update the URL before updating the content
          displayCards(currentPage, pageSize, filteredData); // Use filteredData
          updatePageNavigation(currentPage, pageSize, filteredData);
      }
  } else {
      // Display error message for non-numeric or invalid page number
      displayErrorMessage();
  }
}



function getUniqueAuthors(mods, other) {
  const modsAuthors = mods.flatMap(mod => mod.authors || []);
  const otherAuthors = other.flatMap(item => item.authors || []);
  const allAuthors = [...new Set([...modsAuthors, ...otherAuthors])];
  
  return allAuthors;
}


// Add this function to update the list of authors in the HTML
function updateAuthorsList(authors) {
  const authorsContainer = document.querySelector('.AuthorsContainer');
  authorsContainer.innerHTML = ''; // Clear existing authors

  authors.forEach(author => {
    const authorElement = document.createElement('div');
    authorElement.innerText = author;
    authorsContainer.appendChild(authorElement);
  });
}

// Declare filtersToMakeCheckbox array
const filtersToMakeCheckbox = ['Official', 'FromMembers', 'Author'];

// Constant object mapping filter variable names to display names
const filterDisplayNames = {
  Mods: 'Моди',
  Other: 'Інші',
  Official: 'Офіційні',
  FromMembers: 'Від учасників',
  NotCompleted: 'У роботі',
};



// Modify the createFilterInputs function to include headers
function createFilterInputs(authors) {
  console.log('createFilterInputs function is being called.'); // Add this line for debugging
  console.log('Authors:', authors);
  const filtersContainer = document.querySelector('.FiltersContainer');
  const filtredContainer = document.querySelector('.filtred');
  const filtersForm = document.createElement('form'); // Create form element
  filtersForm.classList.add('filters-form'); // Add class to form
  filtersForm.id = 'filtersForm'; // Add id to form

  const filters = Object.keys(filterDisplayNames);

  // Add headers for Mods/Other and Official/FromMembers/NotCompleted
  const modsHeader = document.createElement('div');
  modsHeader.textContent = 'Тип контенту';
  modsHeader.classList.add('filter-header');
  filtersForm.appendChild(modsHeader);

  const modsContainer = document.createElement('div');
  modsContainer.classList.add('mods-container');
  filtersForm.appendChild(modsContainer);

  const otherContainer = document.createElement('div');
  otherContainer.classList.add('other-container');
  filtersForm.appendChild(otherContainer);

  const otherHeader = document.createElement('div');
  otherHeader.textContent = 'Розширені';
  otherHeader.classList.add('filter-header');
  filtersForm.appendChild(otherHeader);


  filters.forEach(filter => {
    const filterContainer = document.createElement('div');
    filterContainer.classList.add(`${filter.toLowerCase()}`, 'filter');

    const input = document.createElement('input');
    input.type = filter === 'Mods' || filter === 'Other' ? 'checkbox' : 'checkbox';
    input.name = filter === 'Mods' || filter === 'Other' ? 'modsOrOther' : null;
    input.id = filter.toLowerCase();
    input.value = filter;

    // Add event listener only for radio buttons
    if (filter === 'Mods' || filter === 'Other') {
      input.addEventListener('change', () => handleFilterSelection());
    } else {
      input.addEventListener('change', () => handleFilterSelection());
    }

    const label = document.createElement('label');
    label.textContent = filterDisplayNames[filter]; // Use filterDisplayNames object
    label.htmlFor = filter.toLowerCase();

    filterContainer.appendChild(input);
    filterContainer.appendChild(label);

    // Append filters to respective containers based on Mods/Other
    if (filter === 'Mods') {
      modsContainer.appendChild(filterContainer);
    } else if (filter === 'Other') {
      otherContainer.appendChild(filterContainer);
    } else {
      filtersForm.appendChild(filterContainer); // Append filter container to form
    }
  });

  // Create checkboxes for each unique author
  authors.forEach(author => {
    const authorCheckbox = document.createElement('input');
    authorCheckbox.type = 'checkbox';
    authorCheckbox.name = 'authors';
    authorCheckbox.value = author;

    authorCheckbox.addEventListener('change', () => handleFilterSelection());

    const authorLabel = document.createElement('label');
    authorLabel.textContent = author;

    filtersForm.appendChild(authorCheckbox); // Append author checkbox to form
    filtersForm.appendChild(authorLabel); // Append author label to form
  });

  filtredContainer.appendChild(filtersForm); // Append form to filtred container

  // Retrieve selected filters from Session Storage and set checkboxes
  const selectedFilters = sessionStorage.getItem('selectedFilters');
  if (selectedFilters) {
    const filters = selectedFilters.split('&');
    filters.forEach(filter => {
      const input = document.getElementById(filter);
      if (input) {
        input.checked = true;
      }
    });
  }
}







// Function to update the total translation count
function updateTotalTranslation(mods, other) {
  try {
    const totalTranslationSpan = document.getElementById('TotalTranslation');

    if (totalTranslationSpan) {
      const totalTranslations = mods.length + other.length;
      totalTranslationSpan.textContent = `Ми переклали: ${totalTranslations}`;
    } else {
      console.error("Error: TotalTranslation span not found!");
    }
  } catch (error) {
    console.error("Error updating total translation:", error);
  }
}

// Call the function after ensuring modsData and otherData are defined
if (modsData && otherData) {
  updateTotalTranslation(modsData, otherData);
}


// Call the function after ensuring modsData and otherData are defined
if (modsData && otherData) {
  updateTotalTranslation(modsData, otherData);
}

let isPageLoaded = false; // Variable to track whether the page has loaded

// Function to perform a hard refresh (Ctrl+F5)
function hardRefresh() {
  location.reload(true); // Reload the page with a hard refresh
}

// Event listener to perform a hard refresh when the page loads or reloads
window.addEventListener('load', () => {
  const isPageLoaded = sessionStorage.getItem('isPageLoaded');

  if (performance.navigation.type === 1 && !isPageLoaded) { // Check if it's a page reload and not a hard reload
    hardRefresh(); // Call the hardRefresh function
    sessionStorage.setItem('isPageLoaded', true); // Set the isPageLoaded flag in sessionStorage
  } else {
    sessionStorage.removeItem('isPageLoaded'); // Remove the isPageLoaded flag from sessionStorage
  }
});








// Function to update the URL with the current page and selected filters
function updateURL(page) {
  const urlParams = new URLSearchParams(window.location.search);

  // Concatenate selected filters with '&' delimiter and add to URL parameters
  const selectedFilters = Array.from(document.querySelectorAll('.filtred input:checked')).map(checkbox => checkbox.value);
  const filtersString = selectedFilters ? selectedFilters.join('&') : '';
  
  urlParams.set('page', page);
  urlParams.set('filter', filtersString);

  window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
}







// Function to handle toggling between Mods and Other checkboxes
function toggleModsOtherCheckbox() {
  const modsCheckbox = document.querySelector('input[name="modsOrOther"][value="Mods"]');
  const otherCheckbox = document.querySelector('input[name="modsOrOther"][value="Other"]');
  
  // Check if both checkboxes are found before adding event listeners
  if (modsCheckbox && otherCheckbox) {
    modsCheckbox.addEventListener('change', () => {
      if (modsCheckbox.checked) {
        otherCheckbox.checked = false;
        handleFilterSelection();
      }
    });
  
    otherCheckbox.addEventListener('change', () => {
      if (otherCheckbox.checked) {
        modsCheckbox.checked = false;
        handleFilterSelection();
      }
    });
  } else {
    console.error("Error: Mods or Other checkboxes not found!");
  }
}

// Call the toggleModsOtherCheckbox function to set up the event listeners




// Function to handle filter selection
function handleFilterSelection() {
  const selectedFilters = Array.from(document.querySelectorAll('.filtred input:checked')).map(checkbox => checkbox.value);

  // Apply the selected filters to display relevant content
  if (selectedFilters.length === 0) {
    // If no filters are selected, show all data
    filteredData = allData;
  } else {
    // Filter data based on selected filters
    filteredData = allData.filter(item => {
      return selectedFilters.every(filter => {
        if (filter === 'Other') {
          return otherData.includes(item);
        } else if (filter === 'Mods') {
          return modsData.includes(item);
        } else if (filter === 'Official') {
          return item.verified === true;
        } else if (filter === 'FromMembers') {
          return item.author !== 'СУМ';
        } else if (filter === 'NotCompleted') { // Add condition for 'NotCompleted'
          return !item.completed;
        }
        // Add more conditions for other filters if needed
        return true;
      });
    });
    toggleModsOtherCheckbox();
  }

  // Update the displayed cards and page navigation with the filtered data
  displayCards(currentPage, pageSize, filteredData);
  updatePageNavigation(currentPage, pageSize, filteredData);

  // Update the URL with the current page and selected filters
  updateURL(currentPage, selectedFilters);
}

// Call the toggleModsOtherCheckbox function to set up the event listeners
toggleModsOtherCheckbox();



function handleInitialURLParams (){
  saveToStorageHandleInitialURLParams();
  loadFromStorageHandleInitialURLParams();
}

function saveToStorageHandleInitialURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  const filterParam = urlParams.get('filter');

  if (pageParam && !isNaN(pageParam)) {
    currentPage = parseInt(pageParam);
  }

  if (filterParam) {
    sessionStorage.setItem('selectedFilters', filterParam);
  } else {
    // If filterParam is empty or null, set sessionStorage to 'none'
    sessionStorage.setItem('selectedFilters', 'none');
  }
}

function loadFromStorageHandleInitialURLParams() {
  const filterParam = sessionStorage.getItem('selectedFilters');

  if (filterParam && filterParam !== 'none') { // Check if filterParam is not 'none'
    const filters = filterParam.split('&');
    // Update selected filters in the UI
    filters.forEach(filter => {
      const input = document.getElementById(filter);
      if (input) {
        input.checked = true;
        handleFilterSelection(); // Trigger filter selection after setting checkboxes
      }
    });

    // Set selected filters in the form with id "filtersForm"
    const filtersForm = document.getElementById('filtersForm');
    if (filtersForm) {
      filters.forEach(filter => {
        const input = filtersForm.querySelector(`input[value="${filter}"]`);
        if (input) {
          input.checked = true;
          handleFilterSelection(); // Trigger filter selection after setting checkboxes
        }
      });
    }
  } else {
    // If filterParam is 'none' or null, clear the sessionStorage
    sessionStorage.removeItem('selectedFilters');
  }
}




// Function to load filter parameters from sessionStorage and apply them to the form
function loadAndApplyFilterParameters() {
  const filterParam = new URLSearchParams(window.location.search).get('filter');

  if (filterParam && filterParam !== 'none') {
    const filters = filterParam.split('&'); // Use '&' as the separator
    filters.forEach(filter => {
      const input = document.getElementById(filter);
      if (input) {
        input.checked = true;
      }
    });
    handleFilterSelection(); // Apply the saved filters
  }
}

// Call loadAndApplyFilterParameters when the page loads
window.addEventListener('load', loadAndApplyFilterParameters);




// Save filter parameters to sessionStorage
function saveFilterParameters() {
  const selectedFilters = Array.from(document.querySelectorAll('.filtred input:checked')).map(checkbox => checkbox.value);
  const filtersString = selectedFilters.join('&');
  sessionStorage.setItem('selectedFilters', filtersString);
}

// Load filter parameters from sessionStorage and apply them to the form
function loadFilterParameters() {
  const filterParam = sessionStorage.getItem('selectedFilters');

  if (filterParam && filterParam !== 'none') {
    const filters = filterParam.split('&');
    filters.forEach(filter => {
      const input = document.getElementById(filter);
      if (input) {
        input.checked = true;
        handleFilterSelection(); // Apply the saved filters

      }
    });
    handleFilterSelection(); // Apply the saved filters
  }
}

// Call saveFilterParameters when filters are applied
function applyFilters() {
  saveFilterParameters();
  // Apply filters logic
}







// Modify the Promise.all block to include authors
Promise.all([
  fetch('mods.json').then(response => response.json()),
  fetch('other.json').then(response => response.json())
])
  .then(([mods, other]) => {
    modsData = mods;
    otherData = other;
    allData = [...modsData, ...otherData];
    filteredData = allData; // Initialize filteredData with allData

    // Get the unique authors from mods and other data
    const uniqueAuthors = getUniqueAuthors(mods, other);

    pageSize = 12;
    currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

    handleInitialURLParams(); // Call the new function to handle URL parameters

    displayCards(currentPage, pageSize, filteredData);
    updatePageNavigation(currentPage, pageSize, filteredData);
    createFilterInputs(uniqueAuthors);

    // Check if modsData and otherData are defined before calling the function
    if (modsData && otherData) {
      updateTotalTranslation(modsData, otherData);
    }
  })
  .catch(error => console.error("Error loading data:", error));