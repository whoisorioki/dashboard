import requests
import sys


def test_connection(url, service_name):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ {service_name} connection successful")
            return True
        else:
            print(
                f"❌ {service_name} connection failed with status code: {response.status_code}"
            )
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {service_name} connection failed: {e}")
        return False


def main():
    print("🧪 Running Connection Tests...")

    backend_ok = test_connection("http://localhost:8000/docs", "Backend API")
    druid_ok = test_connection("http://localhost:8888/status", "Druid Router")

    if backend_ok and druid_ok:
        print("\n✅ All services are running correctly!")
        sys.exit(0)
    else:
        print("\n❌ Some services are not running correctly.")
        sys.exit(1)


if __name__ == "__main__":
    main()
