// countTranslations.js

// Function to count the total number of translations
export async function countTranslations() {
    try {
        const modsResponse = await fetch('mods.json');
        const otherResponse = await fetch('other.json');

        if (!modsResponse.ok || !otherResponse.ok) {
            throw new Error('Failed to fetch data.');
        }

        const modsData = await modsResponse.json();
        const otherData = await otherResponse.json();

        const totalTranslations = modsData.length + otherData.length;

        // Display the total translation count in the specified element
        const totalTranslationSpan = document.getElementById('TotalTranslation');

        if (totalTranslationSpan) {
            totalTranslationSpan.textContent = `Ми переклали: ${totalTranslations}`;
        } else {
            console.error("Error: TotalTranslation span not found!");
        }
    } catch (error) {
        console.error("Error counting translations:", error);
    }
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    countTranslations();
});
