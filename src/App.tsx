import type { RadioChangeEvent } from "antd";
import { useState, useEffect } from "react";
import { Radio, Button, Spin, Modal } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import OpenAI from "openai";
import { ClubsDeck, DiamondsDeck, HeartsDeck, SpadesDeck } from "./data";
import "./App.css";

interface Card {
  id: number;
  name: string;
  url: string;
}

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedYourCard, setSelectedYourCard] = useState<Card[]>([]);
  const [selectedBoardCard, setSelectedBoardCard] = useState<Card[]>([]);
  const [selectedOppositionCard, setSelectedOppositionCard] = useState<Card[]>(
    []
  );
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [allSelectedCards, setAllSelectedCards] = useState<Card[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string | null>("");
  const [count, setCount] = useState<number>(2);
  const AllDecs = ClubsDeck.concat(DiamondsDeck, HeartsDeck, SpadesDeck);

  useEffect(() => {
    const allCards = selectedYourCard.concat(
      selectedBoardCard,
      selectedOppositionCard
    );
    setAllSelectedCards(allCards);
  }, [selectedYourCard, selectedBoardCard, selectedOppositionCard]);

  const handleAddCard = (id: number) => {
    if (selectedBlock === "yourCards" && selectedYourCard.length < 2) {
      setSelectedYourCard(prev => [
        ...prev,
        AllDecs.find(card => card.id === id) as Card,
      ]);
    }

    if (selectedBlock === "boardCards" && selectedBoardCard.length < 5) {
      setSelectedBoardCard(prev => [
        ...prev,
        AllDecs.find(card => card.id === id) as Card,
      ]);
    }

    if (selectedBlock === "oppositionCards") {
      setSelectedOppositionCard(prev => [
        ...prev,
        AllDecs.find(card => card.id === id) as Card,
      ]);
    }
  };

  const handleRemoveYourCard = (id: number) => {
    const filteredCard = selectedYourCard.filter(card => card.id !== id);

    setSelectedYourCard(filteredCard);
  };

  const handleRemoveBoardCard = (id: number) => {
    const filteredCard = selectedBoardCard.filter(card => card.id !== id);

    setSelectedBoardCard(filteredCard);
  };

  const handleRemoveOppositionCard = (id: number) => {
    const filteredCard = selectedOppositionCard.filter(card => card.id !== id);

    setSelectedOppositionCard(filteredCard);
  };

  const onChange = (e: RadioChangeEvent) => {
    setSelectedBlock(e.target.value);
  };

  const handleClearSelectedCards = () => {
    setSelectedYourCard([]);
    setSelectedBoardCard([]);
    setSelectedOppositionCard([]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams(window.location.search);
    const apiKey = queryParams.get("apiKey");
    const openai = new OpenAI({
      apiKey: apiKey ?? "",
      dangerouslyAllowBrowser: true,
      baseURL: "https://api.aitunnel.ru/v1/",
    });

    const selectedYourCardsText = selectedYourCard
      .map(card => card.name)
      .join(", ");
    const selectedBoardCardsText = selectedBoardCard
      .map(card => card.name)
      .join(", ");
    const selectedOppositionCardsText = selectedOppositionCard
      .map(card => card.name)
      .join(", ");

    // const question = `calculate the percentage of my victory in Texas Hold'em if I have a ${selectedYourCardsText} in my hand, on the table there is a ${selectedBoardCardsText}, and my opponents have an ${selectedOppositionCardsText}`;
    const question = `посчитай процент моей победы в раздаче в Texas Hold'em если за столом осталось ${count} человек включая меня и если у меня в руке ${selectedYourCardsText}, на столе комбинация карт ${selectedBoardCardsText}, а оппоненты сбросили карты ${selectedOppositionCardsText}`;

    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: question }],
      model: "gpt-4o",
      max_tokens: 500,
    });

    setAnswer(response.choices[0]?.message?.content);
    setIsModalOpen(true);
    setLoading(false);
  };

  const Loader = () => (
    <div className="loader">
      <Spin size="large" />
    </div>
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleIncCount = () => {
    setCount(prev => prev + 1);
  };

  const handleDecCoun = () => {
    if (count > 2) {
      setCount(prev => prev - 1);
    }
  };

  return (
    <main>
      {loading && <Loader />}
      <Modal
        title="Ответ"
        open={isModalOpen}
        // onCancel={handleCloseModal}
        footer={[
          <Button key="ok" onClick={handleCloseModal}>
            Закрыть
          </Button>,
        ]}
      >
        {answer}
      </Modal>
      <section className="left-panel">
        <Button
          onClick={handleClearSelectedCards}
          style={{ marginRight: "20px" }}
        >
          Очистить
        </Button>
        <Button
          type="primary"
          style={{ marginRight: "20px" }}
          onClick={handleSubmit}
        >
          Спросить
        </Button>
        <div className="counter">
          <div className="counter__label">Оставшиеся фиши включая тебя</div>
          <Button
            type="primary"
            onClick={handleDecCoun}
            icon={<MinusCircleOutlined />}
          />
          <span style={{ margin: "20px" }}>{count}</span>
          <Button
            type="primary"
            onClick={handleIncCount}
            icon={<PlusCircleOutlined />}
          />
        </div>
        <Radio.Group onChange={onChange} value={selectedBlock}>
          <Radio value="yourCards">
            <div className="selected-panel">
              <div className="selected-panel__label">В твоей руке</div>
              <div className="selected-panel__inner">
                {selectedYourCard.map(card => (
                  <div
                    key={card.id}
                    className="card"
                    onClick={() => handleRemoveYourCard(card.id)}
                  >
                    <img src={card.url} alt={card.name} />
                  </div>
                ))}
              </div>
            </div>
          </Radio>
          <Radio value="boardCards">
            <div className="selected-panel">
              <div className="selected-panel__label">На столе</div>
              <div className="selected-panel__inner">
                {selectedBoardCard.map(card => (
                  <div
                    key={card.id}
                    className="card"
                    onClick={() => handleRemoveBoardCard(card.id)}
                  >
                    <img src={card.url} alt={card.name} />
                  </div>
                ))}
              </div>
            </div>
          </Radio>
          <Radio value="oppositionCards">
            <div className="selected-panel">
              <div className="selected-panel__label">У фишей</div>
              <div className="selected-panel__inner">
                {selectedOppositionCard.map(card => (
                  <div
                    key={card.id}
                    className="card"
                    onClick={() => handleRemoveOppositionCard(card.id)}
                  >
                    <img src={card.url} alt={card.name} />
                  </div>
                ))}
              </div>
            </div>
          </Radio>
        </Radio.Group>
      </section>
      <section className="right-panel">
        {AllDecs.map(card => (
          <div
            key={card.id}
            className="card"
            onClick={() => handleAddCard(card.id)}
            style={{
              display: allSelectedCards.find(i => i.id === card.id)
                ? "none"
                : "block",
            }}
          >
            <img src={card.url} alt={card.name} />
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;
