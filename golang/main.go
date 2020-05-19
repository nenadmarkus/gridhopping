package main

import (
	"fmt"
	"strconv"
	"math"
	"os"
	"encoding/binary"
	"bytes"
)

func sde_scene(x float64, y float64, z float64) float64 {
	return math.Sqrt(x*x + y*y + z*z) - 0.5
}

func run(resolution int64, output string) {
	//
	ntriang := 0

	var emit_triang func (v1 *[3]float64, v2 *[3]float64, v3 *[3]float64)

	if output == "" {
		emit_triang = func (v1 *[3]float64, v2 *[3]float64, v3 *[3]float64) {
			ntriang = ntriang + 1
		}

		PolygonizeGrid(sde_scene, 1.0, resolution, emit_triang)
	} else {
		f, err := os.Create(output)
		if err != nil {
			panic(err)
		}
		defer f.Close()

		var ntriangbuff [4]byte

		header := [80]byte{0, 0, 0, 0}
		f.Write(header[:])
		binary.LittleEndian.PutUint32(ntriangbuff[:], 0)
		f.Write(ntriangbuff[:])

		emit_triang = func (v1 *[3]float64, v2 *[3]float64, v3 *[3]float64) {
			var buff bytes.Buffer
			binary.Write(&buff, binary.LittleEndian, [3]float32{0.0, 0.0, 0.0}) // normal
			binary.Write(&buff, binary.LittleEndian, [3]float32{float32(v1[0]), float32(v1[1]), float32(v1[2])})
			binary.Write(&buff, binary.LittleEndian, [3]float32{float32(v2[0]), float32(v2[1]), float32(v2[2])})
			binary.Write(&buff, binary.LittleEndian, [3]float32{float32(v3[0]), float32(v3[1]), float32(v3[2])})
			binary.Write(&buff, binary.LittleEndian, uint16(0))
			f.Write(buff.Bytes())
			ntriang = ntriang + 1
		}

		PolygonizeGrid(sde_scene, 1.0, resolution, emit_triang)

		f.Seek(80, 0)
		binary.LittleEndian.PutUint32(ntriangbuff[:], uint32(ntriang))
		f.Write(ntriangbuff[:])
	}

	fmt.Println("* the model has ", ntriang, " triangles")
}

func main() {
	if len(os.Args)<2 || len(os.Args)>3 {
		fmt.Println("* args: <resolution> [output]")
		return
	}

	reso, err := strconv.ParseInt(os.Args[1], 10, 32)
	if err != nil {
		panic(err)
	}

	if len(os.Args) == 3 {
		run(reso, os.Args[2])
	} else {
		run(reso, "")
	}
}