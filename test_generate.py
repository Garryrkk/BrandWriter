import asyncio
import httpx

async def test_generate():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8080/api/v1/generations/generate",
                json={
                    "brand_id": "796f40a0-e904-4041-bbf9-242864787201",
                    "category": "Blog Post",
                    "rag_enabled": False,
                    "variations_count": 1
                },
                timeout=30.0
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_generate())
