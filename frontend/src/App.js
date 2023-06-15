import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';


function MandelbrotForm() {
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [x, setX] = useState(-2.5);
  const [y, setY] = useState(-2);
  const [step, setStep] = useState(0.0033);

  const [image, setImage] = useState(null);

  const handleSubmit = (evt) => {
    setLoading(true);
    evt.preventDefault();
    fetch('http://localhost:8001/mandelbrot?width=' + width + '&height=' + height + '&x=' + x + '&y=' + y + '&step=' + step)
      .then(response => response.blob())
      .then(param =>setImage(URL.createObjectURL(param)))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }

  return (<Container fluid>
      <Row>
      <Col sm={4}>
      <Row>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 fs-3 text-start">
            <Form.Label >
              Width
            </Form.Label>
            <Form.Control
              type="text"
              value={width}
              onChange={e => setWidth(e.target.value)}
              isInvalid={!(Number.parseInt(width) === Number.parseFloat(width) && width > 0)}
            />
            <Form.Control.Feedback type="invalid">
              Value must be positive integer
            </Form.Control.Feedback>

          </Form.Group>
          <Form.Group className="mb-3 fs-3 text-start">
            <Form.Label>
              Height
            </Form.Label>
            <Form.Control
              type="text"
              value={height}
              onChange={e => setHeight(e.target.value)}
              isInvalid={!(Number.parseInt(height) === Number.parseFloat(height) && height > 0)}
            />
            <Form.Control.Feedback type="invalid">
              Value must be positive integer
            </Form.Control.Feedback>

          </Form.Group>
          <Form.Group className="mb-3 fs-3 text-start">
            <Form.Label>
              X
            </Form.Label>
            <Form.Control
              type="text"
              value={x}
              onChange={e => setX(e.target.value)}
              isInvalid={Number.isNaN(Number.parseFloat(x))}
            />
            <Form.Control.Feedback type="invalid">
              Value must be number
            </Form.Control.Feedback>

          </Form.Group>
          <Form.Group className="mb-3 fs-3 text-start">
            <Form.Label>
              Y
            </Form.Label>
            <Form.Control
              type="text"
              value={y}
              onChange={e => setY(e.target.value)}
              isInvalid={Number.isNaN(Number.parseFloat(y))}
            />
            <Form.Control.Feedback type="invalid">
              Value must be number
            </Form.Control.Feedback>

          </Form.Group>
          <Form.Group className="mb-3 fs-3 text-start">
            <Form.Label>
              Step
            </Form.Label>
            <Form.Control
              type="text"
              value={step}
              onChange={e => setStep(e.target.value)}
              isInvalid={isNaN(Number.parseFloat(step)) || step <= 0}
            />
            <Form.Control.Feedback type="invalid">
              Value must positive number
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
        </Row>
        <Row class="my-2 py-2 flex align-items-center justify-content-center">
          <Container class="my-3">
         {loading && <Spinner animation="border" role="status" >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        }
        </Container>
        </Row>
      </Col>
      <Col sm={8}>{image && <Image src={image} rounded alt="mandelbrot" fluid/>}</Col>
      </Row>
  </Container>
  );
}

function App() {
  return (
    <div className="App">
      <h1 class="text-start m-5">Mandelbrot viewer</h1>
      <MandelbrotForm />
    </div>
  );
}

export default App;
