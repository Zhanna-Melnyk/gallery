const cardsAmountForLoading = 9;

let currentPage = 1;

const getRandomInt = (max) => {
	return Math.floor(Math.random() * max);
};

function* generateCardDescText() {
	const text = 'Pellentesque vitae velit augue. Donec lobortis interdum augue, et commodo mi posuere at. Etiam quis gravida risus, in venenatis arcu. Aenean ac consequat lorem, et suscipit dui. Integer vehicula massa vel lacus varius, sed rutrum massa porta. Aenean vitae mollis nibh. Vestibulum auctor sapien.';

	yield text.slice(0, getRandomInt(294));
};

const getCardDescText = () => {
	return generateCardDescText().next().value;
};

const createCardView = (data) => {
	const cardsContainer = document.getElementById('cards-container');

	const image = document.createElement('img');
	image.className = 'card-img-top';
	image.alt = 'card-image';
	image.src = data.download_url

	const title = document.createElement('h4');
	title.className = 'card-title fw-bold';

	const desc = document.createElement('p');
	desc.id = `desc-${data.id}`;
	desc.className = 'text-truncate text-truncate-custom mb-2';
	desc.innerText = getCardDescText();

	const cardBody = document.createElement('div');
	cardBody.id = `card-body-${data.id}`;
	cardBody.className = 'card-body';

	const saveBtn = document.createElement('a');
	saveBtn.className = 'btn btn-primary text-white fw-bold me-3 mt-1';
	saveBtn.href = '#';
	saveBtn.innerText = 'Save to collection';

	const shareBtn = document.createElement('a');
	shareBtn.className = 'btn btn-outline-dark fw-bold mt-1 share-btn border-middle-width border-grey ';
	shareBtn.href = '#';
	shareBtn.innerText = 'Share';

	const cardFooter = document.createElement('div');
	cardFooter.className = 'card-footer bg-white pt-1 border-grey';

	const card = document.createElement('div');
	card.className = 'card border-grey';

	const container = document.createElement('section');
	container.className = 'col';
	container.id = `card-${data.id}`

	cardBody.appendChild(title);
	cardBody.appendChild(desc);

	cardFooter.appendChild(saveBtn);
	cardFooter.appendChild(shareBtn);

	card.appendChild(image);
	card.appendChild(cardBody);
	card.appendChild(cardFooter);

	container.appendChild(card);

	cardsContainer.appendChild(container);
};

const createShowBtn = (id, label) => {
	const showBtn = document.createElement('button');

	showBtn.id = id;
	showBtn.className = 'btn bg-white text-dark p-0 lh-1 show-btn';
	showBtn.innerText = label;

	return showBtn;
};

const handleDescCollapsing = ({ body, desc, shouldShowingShowMore }) => {
	const existingShowMoreBtn = document.getElementById(`show-more-${desc.id}`);
	const existingShowLessBtn = document.getElementById(`show-less-${desc.id}`);

	if (shouldShowingShowMore) {
		if (existingShowLessBtn) {
			existingShowLessBtn.remove();
		};

		desc.style.webkitLineClamp = 2;

		const showMoreBtn = createShowBtn(`show-more-${desc.id}`, 'Show more...');
		showMoreBtn.addEventListener('click', () => handleDescCollapsing({ body, desc, shouldShowingShowMore: false }));

		body.appendChild(showMoreBtn);
	} else {
		if (existingShowMoreBtn) {
			existingShowMoreBtn.remove();
		}

		desc.style.webkitLineClamp = 10;

		const showLessBtn = createShowBtn(`show-less-${desc.id}`, 'Show less...');
		showLessBtn.addEventListener('click', () => handleDescCollapsing({ body, desc, shouldShowingShowMore: true }));

		body.appendChild(showLessBtn);
	};
};

const collapseDesc = ({ body, desc, btn }) => {
	if (desc.scrollHeight / 24 > 2) {
		desc.className = 'text-truncate text-truncate-custom mb-2';
		
		if (!btn) {
			handleDescCollapsing({ body, desc, shouldShowingShowMore: true });
		};
	} else if (btn && desc.offsetHeight / 24 <= 2) {
		desc.className = 'mb-2';
		
		btn.remove();
	};
};

const getCardDescAndButtonElements = (cardBody) => {
	const desc = cardBody.querySelector('p');
	const showMoreBtn = cardBody.querySelector('button');

	return {
		desc,
		showMoreBtn
	};
};

const addNewCards = async (pageIdx) => {
	currentPage = pageIdx;

	const cardsData = await fetch(`https://picsum.photos/v2/list?page=${currentPage}&limit=${cardsAmountForLoading}`)
		.then(response => response.json())
		.then(data=> data);
	
	cardsData.forEach(cardData => {
		createCardView(cardData);

		const cardBody = document.getElementById(`card-body-${cardData.id}`);

		const { desc, showMoreBtn } = getCardDescAndButtonElements(cardBody);

		collapseDesc({body: cardBody, desc, btn: showMoreBtn});
	});
}

const handleInfiniteScroll = () => {
	const isEndOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

	if (isEndOfPage) {
		addNewCards(currentPage + 1);
	};
};

const onPageResize = () => {
	const cards = document.querySelectorAll('div.card-body');

	cards.forEach(card => {
		const isDescOpened = card.style.webkitLineClamp === 10;
		
		if (!isDescOpened) {
			const { desc, showMoreBtn } = getCardDescAndButtonElements(card);

			collapseDesc({body: card, desc, btn: showMoreBtn});
		};
	});
};

const debounce = (func, timeout = 100) => {
	let timer;

	return (...args) => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
};

const handleClickDarkMode = (event) => {
	const darkModeSwitch = event.target;

	if (darkModeSwitch.getAttribute('aria-checked') === 'true') {
		darkModeSwitch.setAttribute('aria-checked', 'false');
		document.documentElement.setAttribute('data-bs-theme', 'light')
	} else {
		darkModeSwitch.setAttribute('aria-checked', 'true');
		document.documentElement.setAttribute('data-bs-theme', 'dark')
	}
}

const renderAndAddEventsToPage = () => {
	const handlePageResize = debounce(() => onPageResize());

	const darkModeSwitch = document.getElementById('dark-mode-switch');
	darkModeSwitch.addEventListener('click', handleClickDarkMode)

	window.onload = () => {
		addNewCards(currentPage);
	};

	window.addEventListener('scroll', handleInfiniteScroll);
	window.addEventListener('resize', handlePageResize);
}

renderAndAddEventsToPage();
