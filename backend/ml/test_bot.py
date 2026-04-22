from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

URL = "http://localhost:3000"

driver = webdriver.Chrome()
driver.get(URL)

time.sleep(2)

# 🚨 BOT BEHAVIOR

# 1️⃣ Instant scroll
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(0.1)

# 2️⃣ No mouse movement
# 3️⃣ Type instantly
aadhaar_input = driver.find_element(By.ID, "aadhaar")
aadhaar_input.send_keys("123412341234")

# 4️⃣ Click button (React button has no ID, so we use text)
button = driver.find_element(By.XPATH, "//button[contains(text(),'Proceed Securely')]")
button.click()

# 5️⃣ Wait for notification popup
try:
    wait = WebDriverWait(driver, 10)
    notification = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "notification"))
    )

    print("\n🔍 MODEL RESPONSE:")
    print(notification.text)

except:
    print("\n❌ No notification detected.")

# 🔥 KEEP BROWSER OPEN
input("\nPress ENTER to close browser...")

driver.quit()