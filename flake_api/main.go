// main.go
package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func main() {
	app := pocketbase.New()

	app.OnModelAfterUpdate("planStatus").Add(func(e *core.ModelEvent) error {
		record := e.Model.(*models.Record)
		planId := record.Get("planId").(string)
		cancelStatus, _ := app.Dao().FindFirstRecordByFilter("status", "name = 'Cancelled'")

		records, err := app.Dao().FindRecordsByExpr("planStatus",
			dbx.NewExp("planStatus.planId = {:planId}", dbx.Params{"planId": planId}))

		for index, element := range records {
			if element.Get("statusCode") != cancelStatus.Id {
				return nil
			}
			if index == len(records)-1 {
				plan, _ := app.Dao().FindRecordById("plans", planId)

				plan.Set("planStatus", cancelStatus.Id)
				if err := app.Dao().SaveRecord(plan); err != nil {
					return err
				}
			}
		}

		if err != nil {
			log.Fatal(err)
		}

		return nil
	})

	app.OnModelAfterCreate("plans").Add(func(e *core.ModelEvent) error {
		record := e.Model.(*models.Record)
		friends := record.Get("addresseeId").([]string)
		requestedStatus, _ := app.Dao().FindFirstRecordByFilter("status", "name = 'Requested'")

		collection, err := app.Dao().FindCollectionByNameOrId("planStatus")
		if err != nil {
			return err
		}
		for _, user := range friends {
			planStatusRecord := models.NewRecord(collection)
			planStatusRecord.Set("planId", record.Id)
			planStatusRecord.Set("requesterId", record.Get("requesterId"))
			planStatusRecord.Set("addresseeId", user)
			planStatusRecord.Set("statusCode", requestedStatus.Id)

			if err := app.Dao().SaveRecord(planStatusRecord); err != nil {
				return err
			}
		}

		return nil
	})

	app.OnModelAfterCreate("friendshipStatus").Add(func(e *core.ModelEvent) error {
		record := e.Model.(*models.Record)
		acceptedStatus, _ := app.Dao().FindFirstRecordByFilter("status", "name = 'Accepted'")
		addreseeRecord, _ := app.Dao().FindFirstRecordByFilter("friendshipStatus", "statusCode = {:acceptedStatus} && requesterId = {:addressee} && addresseeId = {:requester}",
			dbx.Params{
				"acceptedStatus": acceptedStatus.Id,
				"addressee":      record.Get("addresseeId"),
				"requester":      record.Get("requesterId"),
			})

		collection, _ := app.Dao().FindCollectionByNameOrId("friendshipStatus")

		if record.Get("statusCode") == acceptedStatus.Id && addreseeRecord == nil {
			friendshipStatusRecord := models.NewRecord((collection))
			friendshipStatusRecord.Set("friendship", record.Get("friendship"))
			friendshipStatusRecord.Set("specifierId", record.Get("addresseeId"))
			friendshipStatusRecord.Set("addresseeId", record.Get("requesterId"))
			friendshipStatusRecord.Set("requesterId", record.Get("addresseeId"))
			friendshipStatusRecord.Set("statusCode", acceptedStatus.Id)

			if err := app.Dao().SaveRecord(friendshipStatusRecord); err != nil {
				return err
			}
		}

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
