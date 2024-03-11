
let modsData;
let otherData;

$(document).ready(() => {
    // Function to get the item ID from the URL query parameter
    function getItemId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Function to fetch the item data based on the item ID
    async function fetchItemData(itemId) {
        try {
            const modsResponse = await $.getJSON('mods.json');
            const otherResponse = await $.getJSON('other.json');
    
            const modsData = modsResponse;
            const otherData = otherResponse;
    
            const allData = [...modsData, ...otherData];
    
            // Find the item with the given ID
            const selectedItem = allData.find(item => item.id === itemId);
    
            return { selectedItem, modsData, otherData };
        } catch (error) {
            console.error("Error fetching item data:", error);
            return null;
        }
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


    function getModIcon(mod) {
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

    // Function to apply styles based on modIcon
function applyIconStyles(modIcon) {
    const itemIconElement = $('#itemicon');

    // Remove existing icon styles
    itemIconElement.removeClass('statusicon completedIcon semiverifiedIcon verifiedIcon');

    // Add styles based on modIcon
    if (modIcon) {
        // Use addIcon function to add the icon dynamically
        addIcon(itemIconElement[0], modIcon);
    }
}


// Function to add icons based on status
function addIcon(element, type) {
    const iconContainer = document.createElement('div');

    // Use Promise to get icon data
    getIconData(type).then(iconData => {
        if (iconData.icon) {
            iconContainer.style.backgroundImage = `url('${iconData.icon}')`;
            iconContainer.classList.add(`statusicon`, `${type}Icon`);
            element.appendChild(iconContainer);
        }
    });
}

    

    // Function to update the item page with the fetched data
    async function updateItemPage() {
        try {
            const itemId = getItemId();
    
            if (itemId) {
                const { selectedItem, modsData, otherData } = await fetchItemData(itemId);
    
                if (selectedItem) {
                    // Create HTML string for tooltip content
                    const tooltipContent = selectedItem.tooltip ? selectedItem.tooltip : (selectedItem.verified ? 'Переклад вже в моді! Завантаження додаткових файлів не потрібно. Насолоджуйтеся грою з українською локалізацією!' : '');
    
                    // Create HTML string for tooltip
                    const tooltipHTML = tooltipContent
                    ? `<div id="tooltip" class="tooltip">${tooltipContent}</div>`
                    : '';
    
                    // Determine the icon based on mod properties
                    const modIcon = getModIcon(selectedItem);
    
                    // Create HTML string for item data
                    const itemHTML = `
                        <div class="ItemContainerInfo">
                            <div class="tooltipContainer">
                                ${tooltipHTML}
                            </div>
                            <div class="TextImageContainer">
                                <div class="ItemImageContainer">
                                    <div class="itemimage" style="background-image: url('${selectedItem.image}');" title="${selectedItem.title} Image" style="max-width: 100%;"></div>
                                    <div id="itemicon" class="ItemIcon"></div>
                                </div>
                                <div class="ItemTextContainer">
                                    <h2 class="itemtitle">${selectedItem.title}</h2>
                                    <p class="itemtranslator">Автори перекладу: ${selectedItem.author}</p>
                                    <p class="itemdescription">${selectedItem.description}</p>
                                </div>
                            </div>
                        </div>
                    `;
    
                    // Set innerHTML of the item container
                    $('#ItemContainer').html(itemHTML);
    
                    // Update the total translation count
                    updateTotalTranslation(modsData, otherData);

                    applyIconStyles(modIcon);
                } else {
                    console.error(`Item with ID ${itemId} not found.`);
                }
            } else {
                console.error("Item ID not provided in the URL.");
            }
        } catch (error) {
            console.error("Error updating item page:", error);
        }
    }

    // Call the function to update the item page when the DOM is loaded
    updateItemPage();
});


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