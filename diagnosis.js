// Diagnosis Page JavaScript - Handles AI Interaction

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const symptomForm = document.getElementById('symptomForm');
    const diagnosisResult = document.getElementById('diagnosisResult');
    const initialState = diagnosisResult.querySelector('.initial-state');
    const loadingState = diagnosisResult.querySelector('.loading-state');
    const resultState = diagnosisResult.querySelector('.result-state');
    const resultContent = document.getElementById('resultContent');
    const resultTimestamp = document.getElementById('resultTimestamp');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    
    // API Key for Gemini
    const API_KEY = 'AIzaSyDz9OBDtF-1gZu6cdvMezMBvAUeK63QRJ0';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    // Form Submission
    if (symptomForm) {
        symptomForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            initialState.style.display = 'none';
            loadingState.style.display = 'flex';
            resultState.style.display = 'none';
            
            // Get form data
            const formData = new FormData(symptomForm);
            const age = formData.get('age');
            const gender = formData.get('gender');
            const mainSymptom = formData.get('mainSymptom');
            const symptomDuration = formData.get('symptomDuration');
            const additionalSymptoms = formData.get('additionalSymptoms') || 'None';
            const medicalHistory = formData.get('medicalHistory') || 'None';
            
            // Create prompt for Gemini
            const prompt = `
                You are a medical AI assistant. Please analyze the following patient information and provide a preliminary assessment of possible conditions. 
                This is for demonstration purposes only and not a real medical diagnosis.
                
                Patient Information:
                - Age: ${age}
                - Gender: ${gender}
                - Main Symptom: ${mainSymptom}
                - Duration: ${symptomDuration}
                - Additional Symptoms: ${additionalSymptoms}
                - Medical History: ${medicalHistory}
                
                Please provide:
                1. A brief summary of the symptoms
                2. 3-5 possible conditions that might cause these symptoms (from most to least likely)
                3. General recommendations (when to see a doctor, home care suggestions)
                
                Format your response in a clear, structured way with headings and bullet points.
                Include a disclaimer that this is not a medical diagnosis.
            `;
            
            try {
                // Call Gemini API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });
                
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                
                const data = await response.json();
                
                // Get the response text
                let aiResponse = '';
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const parts = data.candidates[0].content.parts;
                    if (parts && parts.length > 0) {
                        aiResponse = parts[0].text;
                    }
                }
                
                if (!aiResponse) {
                    throw new Error('No response from AI');
                }
                
                // Format the response with markdown-it
                const formattedResponse = formatAIResponse(aiResponse);
                
                // Set the result content
                resultContent.innerHTML = formattedResponse;
                
                // Set timestamp
                const now = new Date();
                resultTimestamp.textContent = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
                
                // Show result state
                initialState.style.display = 'none';
                loadingState.style.display = 'none';
                resultState.style.display = 'flex';
                
                // Scroll to result if on mobile
                if (window.innerWidth < 992) {
                    diagnosisResult.scrollIntoView({ behavior: 'smooth' });
                }
                
            } catch (error) {
                console.error('Error:', error);
                
                // Show error in result
                resultContent.innerHTML = `
                    <div class="error-message">
                        <h4>Oops! Something went wrong</h4>
                        <p>We couldn't process your request at this time. Please try again later.</p>
                        <p>Error details: ${error.message}</p>
                    </div>
                `;
                
                // Set timestamp
                const now = new Date();
                resultTimestamp.textContent = `Error occurred on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
                
                // Show result state
                initialState.style.display = 'none';
                loadingState.style.display = 'none';
                resultState.style.display = 'flex';
            }
        });
    }
    
    // New Analysis Button
    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', function() {
            // Reset form
            symptomForm.reset();
            
            // Show initial state
            initialState.style.display = 'block';
            loadingState.style.display = 'none';
            resultState.style.display = 'none';
            
            // Scroll to form if on mobile
            if (window.innerWidth < 992) {
                symptomForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Helper function to format AI response
    function formatAIResponse(text) {
        // Simple formatting for headings, lists, and paragraphs
        return text
            // Format headings
            .replace(/^###\s*(.*?)$/gm, '<h4>$1</h4>')
            .replace(/^##\s*(.*?)$/gm, '<h3>$1</h3>')
            .replace(/^#\s*(.*?)$/gm, '<h2>$1</h2>')
            // Format lists
            .replace(/^\*\s*(.*?)$/gm, '<li>$1</li>')
            .replace(/^-\s*(.*?)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\.\s*(.*?)$/gm, '<li>$1. $2</li>')
            // Wrap lists
            .replace(/(<li>.*?<\/li>)\n(?!<li>)/g, '$1</ul>\n')
            .replace(/(?<!<\/ul>\n)(<li>)/g, '<ul>$1')
            // Format paragraphs
            .replace(/\n\n/g, '</p><p>')
            // Wrap in paragraph if not already
            .replace(/^(?!<h|<ul|<p)(.+)$/gm, '<p>$1</p>')
            // Fix any double paragraph tags
            .replace(/<\/p><p><\/p><p>/g, '</p><p>')
            // Bold text between **
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text between *
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
});