import requests
import sys
import json
from datetime import datetime

class ActaDiurnaAPITester:
    def __init__(self, base_url="https://ancient-posts.preview.emergentagent.com"):
        self.base_url = base_url
        self.user1_token = None
        self.user2_token = None
        self.user1_data = None
        self.user2_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                pass

            if success:
                self.log_test(name, True)
                return True, response_data
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, response_data

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration for two users"""
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Register User 1
        user1_data = {
            "email": f"user1_{timestamp}@test.com",
            "username": f"TestUser1_{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Register User 1",
            "POST",
            "auth/register",
            200,
            data=user1_data
        )
        
        if success and 'access_token' in response:
            self.user1_token = response['access_token']
            self.user1_data = response['user']
            
        # Register User 2
        user2_data = {
            "email": f"user2_{timestamp}@test.com",
            "username": f"TestUser2_{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Register User 2",
            "POST",
            "auth/register",
            200,
            data=user2_data
        )
        
        if success and 'access_token' in response:
            self.user2_token = response['access_token']
            self.user2_data = response['user']

        return self.user1_token and self.user2_token

    def test_user_login(self):
        """Test user login"""
        if not self.user1_data:
            return False
            
        login_data = {
            "email": self.user1_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success and 'access_token' in response

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            token=self.user1_token
        )
        
        return success and response.get('id') == self.user1_data['id']

    def test_create_story(self):
        """Test story creation"""
        story_data = {
            "title": "My Test Story",
            "content": "This is a test story content with multiple lines.\n\nIt has paragraphs and should work well.",
            "photos": []
        }
        
        success, response = self.run_test(
            "Create Story (User 1)",
            "POST",
            "stories",
            200,
            data=story_data,
            token=self.user1_token
        )
        
        # Create story for User 2 as well
        story_data2 = {
            "title": "User 2 Story",
            "content": "This is user 2's story content.",
            "photos": []
        }
        
        success2, response2 = self.run_test(
            "Create Story (User 2)",
            "POST",
            "stories",
            200,
            data=story_data2,
            token=self.user2_token
        )
        
        return success and success2

    def test_get_my_stories(self):
        """Test getting user's own stories"""
        success, response = self.run_test(
            "Get My Stories",
            "GET",
            "stories/my",
            200,
            token=self.user1_token
        )
        
        return success and len(response) > 0

    def test_send_friend_request(self):
        """Test sending friend request"""
        friend_request_data = {
            "to_email": self.user2_data['email']
        }
        
        success, response = self.run_test(
            "Send Friend Request",
            "POST",
            "friends/request",
            200,
            data=friend_request_data,
            token=self.user1_token
        )
        
        return success

    def test_get_friend_requests(self):
        """Test getting friend requests"""
        success, response = self.run_test(
            "Get Friend Requests",
            "GET",
            "friends/requests",
            200,
            token=self.user2_token
        )
        
        return success and len(response) > 0

    def test_accept_friend_request(self):
        """Test accepting friend request"""
        # First get the friend requests
        success, requests = self.run_test(
            "Get Friend Requests for Accept",
            "GET",
            "friends/requests",
            200,
            token=self.user2_token
        )
        
        if not success or len(requests) == 0:
            self.log_test("Accept Friend Request", False, "No friend requests found")
            return False
        
        request_id = requests[0]['id']
        action_data = {
            "request_id": request_id,
            "action": "accept"
        }
        
        success, response = self.run_test(
            "Accept Friend Request",
            "POST",
            "friends/action",
            200,
            data=action_data,
            token=self.user2_token
        )
        
        return success

    def test_get_friends(self):
        """Test getting friends list"""
        success, response = self.run_test(
            "Get Friends List",
            "GET",
            "friends",
            200,
            token=self.user1_token
        )
        
        return success and len(response) > 0

    def test_get_stories_feed(self):
        """Test getting stories from friends"""
        success, response = self.run_test(
            "Get Stories Feed",
            "GET",
            "stories",
            200,
            token=self.user1_token
        )
        
        # Should have stories from both users now that they're friends
        return success and len(response) >= 2

    def test_image_upload_without_cloudinary(self):
        """Test image upload (should fail without Cloudinary credentials)"""
        # This should fail with 400 status as expected
        success, response = self.run_test(
            "Image Upload (Expected to Fail)",
            "POST",
            "upload",
            400,  # Expected to fail
            token=self.user1_token
        )
        
        return success  # Success means it failed as expected

    def test_user_search(self):
        """Test user search functionality"""
        success, response = self.run_test(
            "Search Users",
            "GET",
            f"users/search?query={self.user2_data['username'][:5]}",
            200,
            token=self.user1_token
        )
        
        return success and len(response) > 0

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Acta Diurna API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)

        # Test user registration and authentication
        if not self.test_user_registration():
            print("❌ User registration failed - stopping tests")
            return False

        self.test_user_login()
        self.test_get_current_user()

        # Test story functionality
        self.test_create_story()
        self.test_get_my_stories()

        # Test friend system
        self.test_send_friend_request()
        self.test_get_friend_requests()
        self.test_accept_friend_request()
        self.test_get_friends()
        self.test_get_stories_feed()

        # Test additional features
        self.test_image_upload_without_cloudinary()
        self.test_user_search()

        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = ActaDiurnaAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%",
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())