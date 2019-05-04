*** Settings ***
Library  Collections
Library  RequestsLibrary
Resource  shared_keywords.robot

Documentation  Test suite verifying scenarios related to user & project management (see requirement SE-4).

**** Variables ***
${REQUEST_TIMEOUT_DEFAULT}  5000

*** Test Cases ***
Login Of Non-existing User Is Rejected
    [Tags]  SE-8
    When Login With Email "non-existing@gmail.com" And Password "password"
    Then Response Is Not Successful
    and Response Contains Error Message "Invalid user credentials - try again."

Login After Valid Registration Is Successful
    [Tags]   SE-8
    [Setup]  Set Test Variable  &{credentials}
    ...      name=Test Name  surname=Test Surname  email=login-after-registration-valid@gmail.com  password=password
    
    Given Create User Account With Credentials "${credentials}"
    and Response Is Successful
    When Login With Email "login-after-registration-valid@gmail.com" And Password "password"
    Then Response Is Successful
    
Registration With Missing Data Is Rejected
    [Tags]  SE-8
    [Setup]  Set Test Variable  &{credentials}
    ...      name=Test Name  surname=Test Surname  email=registration-missing-data@gmail.com
    
    When Create User Account With Credentials "${credentials}"
    Then Response Is Not Successful
    and Response Contains Error Message "Required user attributes are missing"

Registration With Invalid Data Is Rejected
    [Tags]  SE-8
    [Setup]  Set Test Variable  &{credentials}
    ...      name=Test Name  surname=Test Surname  email=registration-invalid-data.com  password=password
    
    When Create User Account With Credentials "${credentials}"
    Then Response Is Not Successful
    and Response Contains Error Message "Malformed input data - please, try again."

Duplicate Registration Is Rejected
    [Tags]  SE-8
    [Setup]   Set Test Variable  &{credentials}
    ...  name=Test Name  surname=Test Surname  email=registration-duplicate@gmail.com  password=password

    Given Create User Account With Credentials "${credentials}"
    and Response Is Successful
    When Create User Account With Credentials "${credentials}"
    Then Response Is Not Successful
    and Response Contains Error Message "Integrity error: e-mail address is already taken."

*** Keywords ***
Create User Account With Credentials "${credentials}"
    [Documentation]  Attempts to create a new user account with specified user credentials.

    ${credentials_json}=  Evaluate  json.dumps(${credentials})  modules=json
    ${response}=  Post Request
    ...  scanpath-evaluator  /api/user/add  data=${credentials_json}  timeout=${REQUEST_TIMEOUT_DEFAULT}
    Set Test Variable  ${TEST_RESPONSE}  ${response}

Login With Email "${email}" And Password "${password}"
    [Documentation]  Performs a login request with specified credentials.

    &{credentials}=  Create Dictionary  email=${email}  password=${password}
    ${credentials_json}=  Evaluate  json.dumps(${credentials})  json
    ${response}=  Post Request
    ...  scanpath-evaluator  /api/user/auth  data=${credentials_json}  timeout=${REQUEST_TIMEOUT_DEFAULT}
    Set Test Variable  ${TEST_RESPONSE}  ${response}