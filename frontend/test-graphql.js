// Simple GraphQL test to debug the 422 error
async function testGraphQL() {
    try {
        const response = await fetch('http://localhost:8000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query IntrospectionQuery {
                        __schema {
                            types {
                                name
                                kind
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (response.status === 422) {
            console.error('422 Error Details:', data);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Run the test
testGraphQL();
