// These tests sign in with user #4 and user #5

import SeleniumHelper from './selenium-helpers.js';

const {
    findByXpath,
    buildDriver,
    clickXpath,
    clickText,
    signIn
} = new SeleniumHelper();

// Using 1 and 2 here. Hopefully this is not confusing.
let username1 = process.env.SMOKE_USERNAME + '4';
let username2 = process.env.SMOKE_USERNAME + '5';
let password = process.env.SMOKE_PASSWORD;

let remote = process.env.SMOKE_REMOTE || false;
let rootUrl = process.env.ROOT_URL || 'https://scratch.ly';

// project for comments (owned by username2)
let projectId = process.env.COMMENT_PROJECT_ID || 1300008409;
let projectUrl = `${rootUrl}/projects/${projectId}`;

// profile for comments (username2)
let profileUrl = `${rootUrl}/users/${username2}`;

// studio for comments (hosted by username2) comments tab
let studioId = process.env.COMMENT_STUDIO_ID || 10005646;
let studioUrl = `${rootUrl}/studios/${studioId}/comments`;

let date = new Date();
let dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` +
`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
let buildNumber = process.env.CIRCLE_BUILD_NUM || dateString;

if (remote) {
    jest.setTimeout(60000);
} else {
    jest.setTimeout(20000);
}

let driver;

describe('comment tests', async () => {
    beforeAll(async () => {
        driver = await buildDriver('www-integration project comments');
        driver.get(rootUrl);
    });

    afterEach(async () => {
        await clickXpath('//a[contains(@class, "user-info")]');
        await clickText('Sign out');
    });

    afterAll(async () => await driver.quit());

    test('leave comment on project', async () => {
        await signIn(username1, password, driver);
        await findByXpath('//span[contains(@class, "profile-name")]');
        await driver.get(projectUrl);

        // leave the comment
        let commentBox = await findByXpath('//textArea[@name="compose-comment"]');
        await commentBox.sendKeys(buildNumber);
        await findByXpath(`//textarea[contains(text(), "${buildNumber}")]`);
        await clickXpath('//button[@class="button compose-post"]');

        // reload the page
        await driver.sleep(5000);
        await driver.get(projectUrl);

        // find the comment
        let commentXpath = await `//div[@class="comment-bubble"]/span/span[contains(text(), "${buildNumber}")]`;
        let postedComment = await findByXpath(commentXpath);
        let commentVisible = await postedComment.isDisplayed();
        await expect(commentVisible).toBe(true);
    });

    test('leave comment on a profile', async () => {
        await signIn(username1, password, driver);
        await findByXpath('//span[contains(@class, "profile-name")]');
        await driver.get(profileUrl);

        // leave the comment
        let commentXpath = await '//form[@id="main-post-form"]/div/textArea';
        let commentArea = await findByXpath(commentXpath);
        await commentArea.sendKeys(buildNumber);
        await clickXpath('//div[@class="button small"]/a[contains(text(), "Post")]');

        // reload page
        await driver.get(profileUrl);

        // find the comment
        let newComment = await findByXpath(`//div[@class="comment "]/div/div[contains(text(), "${buildNumber}")]`);
        let commentVisible = await newComment.isDisplayed();
        await expect(commentVisible).toBe(true);

        // return to homepage to sign out with www
        await driver.get(rootUrl);
    });

    test('leave comment on studio', async () => {
        await signIn(username1, password, driver);
        await findByXpath('//span[contains(@class, "profile-name")]');
        await driver.get(studioUrl);

        // leave the comment
        let commentBox = await findByXpath('//textArea[@name="compose-comment"]');
        await commentBox.sendKeys(buildNumber);
        await findByXpath(`//textarea[contains(text(), "${buildNumber}")]`);
        await clickXpath('//button[@class="button compose-post"]');

        // reload the page
        await driver.sleep(5000);
        await driver.get(studioUrl);

        // find the comment
        let commentXpath = `//div[@class="comment-bubble"]/span/span[contains(text(), "${buildNumber}")]`;
        let postedComment = await findByXpath(commentXpath);
        let commentVisible = await postedComment.isDisplayed();
        await expect(commentVisible).toBe(true);
    });
});
