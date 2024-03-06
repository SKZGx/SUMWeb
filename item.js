
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

    // Function to update the item page with the fetched data
    async function updateItemPage() {
        try {
            const itemId = getItemId();
    
            if (itemId) {
                const { selectedItem, modsData, otherData } = await fetchItemData(itemId);
    
                if (selectedItem) {
                    // Create HTML string for item data
                    const itemHTML = `
                        <div class="ItemContainerInfo">
                            <div class="ItemImageContainer">
                                <div class="itemimage" style="background-image: url('${selectedItem.image}');" title="${selectedItem.title} Image" style="max-width: 100%;"></div>
                            </div>
                            <div class="ItemTextContainer">
                                <h2 class="itemtitle">${selectedItem.title}</h2>
                                <p class="itemtranslator">Автори перекладу: ${selectedItem.author}</p>
                                <p class="itemdescription">${selectedItem.description}</p>
                            </div>
                        </div>
                    `;
    
                    // Set innerHTML of the item container
                    $('#ItemContainer').html(itemHTML);
    
                    // Update the total translation count
                    updateTotalTranslation(modsData, otherData);
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